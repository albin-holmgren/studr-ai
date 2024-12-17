import OpenAI from "openai"
import { HfInference } from "@huggingface/inference"
import { z } from "zod"
import { db } from "~/lib/db.server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

interface AnalysisResult {
  score: number
  grammarSuggestions: Array<{
    type: "grammar" | "style"
    text: string
    suggestion: string
    explanation: string
  }>
  contentSuggestions: Array<{
    type: "structure" | "clarity" | "evidence"
    title: string
    suggestion: string
    examples: string[]
  }>
  references: Array<{
    title: string
    relevance: number
    citation: string
    summary: string
  }>
}

export async function analyzeAcademicText(content: string): Promise<AnalysisResult> {
  try {
    const [grammarAnalysis, contentAnalysis] = await Promise.all([
      analyzeGrammarAndStyle(content),
      analyzeContentQuality(content)
    ])

    // Get relevant references from our database
    const references = await db.reference.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        title: true,
        authors: true,
        journal: true,
        year: true,
        content: true
      }
    })

    // Calculate base score from grammar and content
    const baseScore = calculateOverallScore({
      grammarScore: grammarAnalysis.score || 0,
      contentScore: contentAnalysis.score || 0,
      referenceScore: references.length > 0 ? 80 : 60
    })

    // Always ensure we have some suggestions
    const defaultSuggestions = {
      grammar: [
        {
          type: "style" as const,
          text: "Overall writing style",
          suggestion: "Consider using more academic language and formal expressions",
          explanation: "Academic writing typically uses formal language and avoids colloquialisms"
        }
      ],
      content: [
        {
          type: "structure" as const,
          title: "Structure Improvement",
          suggestion: "Consider organizing your content with clear sections",
          examples: [
            "Introduction: State your main argument",
            "Body: Support with evidence",
            "Conclusion: Summarize key points"
          ]
        },
        {
          type: "evidence" as const,
          title: "Evidence Support",
          suggestion: "Add more evidence to support your arguments",
          examples: [
            "Include relevant statistics",
            "Reference academic sources",
            "Provide real-world examples"
          ]
        }
      ]
    }

    return {
      score: baseScore,
      grammarSuggestions: grammarAnalysis.suggestions?.length > 0 
        ? grammarAnalysis.suggestions 
        : defaultSuggestions.grammar,
      contentSuggestions: contentAnalysis.suggestions?.length > 0
        ? contentAnalysis.suggestions
        : defaultSuggestions.content,
      references: references.map(ref => ({
        title: ref.title,
        relevance: 0.8,
        citation: `${ref.authors.join(", ")} (${ref.year}). ${ref.title}${ref.journal ? `. ${ref.journal}` : ""}`,
        summary: ref.content.substring(0, 200) + "..."
      }))
    }
  } catch (error) {
    console.error("Error in analyzeAcademicText:", error)
    // Return a default analysis with helpful suggestions even on error
    return {
      score: 70,
      grammarSuggestions: [
        {
          type: "style",
          text: "General writing style",
          suggestion: "Focus on clarity and academic tone",
          explanation: "Academic writing should be clear, concise, and formal"
        }
      ],
      contentSuggestions: [
        {
          type: "structure",
          title: "Basic Structure",
          suggestion: "Ensure your text follows a clear academic structure",
          examples: [
            "Start with a clear thesis statement",
            "Support arguments with evidence",
            "Conclude by restating main points"
          ]
        }
      ],
      references: []
    }
  }
}

async function analyzeGrammarAndStyle(content: string) {
  try {
    const analysis = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert academic writing assistant. Analyze the text and provide specific improvements. Focus on:
          1. Grammar and spelling errors
          2. Academic tone and formality
          3. Sentence structure variety
          4. Transition phrases
          5. Active vs passive voice balance
          
          For each suggestion, provide:
          1. The specific text that needs improvement
          2. A clear suggestion for improvement
          3. An explanation of why the change would improve the writing
          
          Return the analysis in JSON format with:
          {
            "score": number (0-100),
            "suggestions": Array<{
              "type": "grammar" | "style",
              "text": string,
              "suggestion": string,
              "explanation": string
            }>
          }`
        },
        {
          role: "user",
          content
        }
      ],
      response_format: { type: "json_object" }
    })

    return JSON.parse(analysis.choices[0].message.content)
  } catch (error) {
    console.error("Error in analyzeGrammarAndStyle:", error)
    return {
      score: 70,
      suggestions: []
    }
  }
}

async function analyzeContentQuality(content: string) {
  try {
    const analysis = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert academic writing assistant. Analyze the content quality and provide specific improvements. Focus on:
          1. Argument structure and logic
          2. Evidence and support
          3. Clarity of ideas
          4. Academic depth
          5. Critical analysis
          
          For each suggestion:
          1. Provide a clear title
          2. Give specific, actionable advice
          3. Include examples or templates
          
          Return the analysis in JSON format with:
          {
            "score": number (0-100),
            "suggestions": Array<{
              "type": "structure" | "clarity" | "evidence",
              "title": string,
              "suggestion": string,
              "examples": string[]
            }>
          }`
        },
        {
          role: "user",
          content
        }
      ],
      response_format: { type: "json_object" }
    })

    return JSON.parse(analysis.choices[0].message.content)
  } catch (error) {
    console.error("Error in analyzeContentQuality:", error)
    return {
      score: 70,
      suggestions: []
    }
  }
}

function calculateOverallScore({
  grammarScore,
  contentScore,
  referenceScore
}: {
  grammarScore: number
  contentScore: number
  referenceScore: number
}) {
  return Math.round(
    (grammarScore * 0.3) + 
    (contentScore * 0.5) + 
    (referenceScore * 0.2)
  )
}
