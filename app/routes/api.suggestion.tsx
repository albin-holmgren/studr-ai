import { Grammarly } from "@stewartmcgown/grammarly-api";
import { json, type ActionFunctionArgs } from "@remix-run/node"
import axios from "axios";
export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    
    const noteId = formData.get('noteId');
    const content = formData.get('content');

    if (!noteId || !content) {
      return new Response(
        JSON.stringify({ message: "noteId and content are required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const grammarly = new Grammarly();
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B',
      {
        inputs: `${content}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );

    const suggestion = response.data[0]?.generated_text || 'No suggestions found.';
    const corrections = await grammarly.analyse(content); 
    const score = calculateScore(content);
    return new Response(
      JSON.stringify({
        noteId,
        content,
        corrections: corrections,
        suggestion,
        score,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

function calculateScore(content: string): number {
  const wordCount = content.split(' ').length;

  const sentenceCount = content.split('.').length;
  const syllableCount = content.split(' ').reduce((acc, word) => acc + syllables(word), 0);

  const fleschScore = 206.835 - (1.015 * (wordCount / sentenceCount)) - (84.6 * (syllableCount / wordCount));
  
  let score = 50;

  if (fleschScore > 70) {
    score = 85; 
  } else if (fleschScore > 50) {
    score = 70; 
  } else {
    score = 55;
  }

  if (wordCount > 100) {
    score = Math.min(score + 10, 90); 
  } else if (wordCount > 50) {
    score = Math.max(score - 5, 50);
  } else {
    score = Math.max(score - 10, 50)
  }

  return score;
}

function syllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1; 
  const syllableMatch = word.match(/[aeiouy]{1,2}/g);
  return syllableMatch ? syllableMatch.length : 1;
}

