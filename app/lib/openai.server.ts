import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatCompletion(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  options: { temperature?: number; max_tokens?: number } = {}
) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 500,
  });

  return completion.choices[0]?.message?.content || '';
}

export async function getDocumentResponse(message: string, documentTitle?: string) {
  const systemPrompt = `You are an AI assistant helping users understand and work with their documents.
${documentTitle ? `You are currently helping with a document titled "${documentTitle}".` : ''}

Your role is to:
1. Provide clear, concise, and helpful responses
2. Help users understand their documents better
3. Suggest improvements or insights when relevant
4. Be honest when you're not sure about something

Respond in a friendly, professional tone. Keep responses focused and to-the-point.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: message }
  ];

  return getChatCompletion(messages, {
    temperature: 0.7,
    max_tokens: 500
  });
}
