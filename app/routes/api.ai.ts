import { json } from '@remix-run/node'
import type { ActionFunction } from '@remix-run/node'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const PROMPTS = {
  simplify: 'Simplify the following text while keeping its meaning:',
  fixSpelling: 'Fix any spelling and grammar errors in the following text:',
  makeShorter: 'Make the following text more concise:',
  makeLonger: 'Expand the following text with more details:',
  emojify: 'Add relevant emojis to the following text:',
  tldr: 'Summarize the following text in a brief TL;DR format:',
  translate: 'Translate the following text to',
  tone: 'Rewrite the following text in a',
  completeSentence: 'Complete the following text naturally:',
}

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const { text, action, param } = await request.json()
    let prompt = PROMPTS[action as keyof typeof PROMPTS]
    
    if (action === 'translate') {
      prompt = `${prompt} ${param}:`
    } else if (action === 'tone') {
      prompt = `${prompt} ${param} tone:`
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful writing assistant. Your task is to modify the provided text according to the given instruction.',
        },
        {
          role: 'user',
          content: `${prompt}\n\n${text}`,
        },
      ],
      temperature: 0.7,
    })

    const generatedText = completion.choices[0]?.message?.content || ''
    return json({ text: generatedText })
  } catch (error) {
    console.error('Error processing AI request:', error)
    return json({ error: 'Failed to process request' }, { status: 500 })
  }
}
