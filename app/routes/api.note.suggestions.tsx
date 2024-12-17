import { json, type ActionFunctionArgs } from "@remix-run/node"
import { db } from "~/lib/db.server"
import { z } from "zod"
import { analyzeAcademicText } from "~/services/ai-analysis.server"

const suggestionSchema = z.object({
  noteId: z.string(),
  content: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const validation = suggestionSchema.safeParse({
    noteId: formData.get("noteId"),
    content: formData.get("content"),
  })

  if (!validation.success) {
    return json({ error: "Invalid request" }, { status: 400 })
  }

  const { noteId, content } = validation.data

  try {
    // Get the current note from the database
    const note = await db.note.findUnique({
      where: { id: noteId },
      select: { content: true }
    })

    if (!note) {
      return json({ error: "Note not found" }, { status: 404 })
    }

    // Analyze the content using our comprehensive AI analysis
    const analysis = await analyzeAcademicText(content)

    // Transform the analysis results into suggestions
    const suggestions = [
      // Grammar and Style Suggestions
      ...analysis.grammarSuggestions.map(suggestion => ({
        id: crypto.randomUUID(),
        type: "improvement",
        title: `Improve ${suggestion.type === "grammar" ? "Grammar" : "Writing Style"}`,
        content: {
          summary: suggestion.explanation,
          highlights: [
            `Original: "${suggestion.text}"`,
            `Suggestion: "${suggestion.suggestion}"`,
          ]
        }
      })),
      // Content Quality Suggestions
      ...analysis.contentSuggestions.map(suggestion => ({
        id: crypto.randomUUID(),
        type: suggestion.type === "structure" ? "enhancement" : "insight",
        title: suggestion.title,
        content: {
          summary: suggestion.suggestion,
          highlights: suggestion.examples
        }
      })),
      // Reference Suggestions
      ...analysis.references.map(reference => ({
        id: crypto.randomUUID(),
        type: "insight",
        title: "Add Relevant Reference",
        content: {
          summary: `Consider citing: ${reference.title}`,
          highlights: [
            reference.summary,
            `Citation: ${reference.citation}`,
            `Relevance Score: ${(reference.relevance * 100).toFixed(1)}%`
          ]
        }
      }))
    ]

    // Store the suggestions in the database
    await db.suggestion.deleteMany({
      where: { noteId }
    })

    await db.suggestion.createMany({
      data: suggestions.map(suggestion => ({
        noteId,
        type: suggestion.type,
        title: suggestion.title,
        summary: suggestion.content.summary,
        highlights: suggestion.content.highlights,
        score: analysis.score
      }))
    })

    return json({ 
      success: true,
      score: analysis.score,
      suggestions
    })
  } catch (error) {
    console.error("Error generating suggestions:", error)
    return json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
