import { json } from '@remix-run/node'
import type { ActionFunction } from '@remix-run/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const { prompt } = await request.json()

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful writing assistant. Continue the text in a natural and coherent way.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const generatedText = completion.choices[0]?.message?.content || ''

    return json({ text: generatedText })
  } catch (error) {
    console.error('Error generating content:', error)
    return json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
