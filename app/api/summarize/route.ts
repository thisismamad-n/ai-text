import { NextResponse } from 'next/server'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

interface SummarizeRequest {
  text: string
  mode: 'paragraph' | 'bullet' | 'custom'
  length: number
  customInstructions?: string
  apiSettings: {
    provider: 'mistral' | 'openai' | 'anthropic'
    apiKey: string
  }
}

export async function POST(req: Request) {
  try {
    const { text, mode, length, customInstructions, apiSettings }: SummarizeRequest = await req.json()

    if (!apiSettings?.apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    let prompt = ''
    switch (mode) {
      case 'paragraph':
        prompt = `Summarize the following text in a single paragraph. Make the summary ${length < 0.3 ? 'very concise' : length > 0.7 ? 'detailed' : 'moderate in length'}:\n\n${text}`
        break
      case 'bullet':
        prompt = `Summarize the following text in bullet points. Provide ${length < 0.3 ? 'few' : length > 0.7 ? 'many' : 'some'} key points:\n\n${text}`
        break
      case 'custom':
        prompt = `${customInstructions || 'Summarize the following text in a creative way'}. The summary should be ${length < 0.3 ? 'very brief' : length > 0.7 ? 'comprehensive' : 'balanced'}:\n\n${text}`
        break
      default:
        return NextResponse.json(
          { error: 'Invalid mode specified' },
          { status: 400 }
        )
    }

    let response
    switch (apiSettings.provider) {
      case 'openai':
        response = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiSettings.apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a helpful AI assistant that specializes in summarizing text."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: Math.floor(text.length * length)
          })
        })
        break

      case 'mistral':
        response = await fetch(MISTRAL_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiSettings.apiKey}`
          },
          body: JSON.stringify({
            model: "mistral-tiny",
            messages: [
              {
                role: "system",
                content: "You are a helpful AI assistant that specializes in summarizing text."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: Math.floor(text.length * length)
          })
        })
        break

      case 'anthropic':
        response = await fetch(ANTHROPIC_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiSettings.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: "claude-2",
            max_tokens: Math.floor(text.length * length),
            messages: [{
              role: "user",
              content: prompt
            }]
          })
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid provider specified' },
          { status: 400 }
        )
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('AI API error:', errorData)
      return NextResponse.json(
        { error: `Failed to get response from ${apiSettings.provider}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    let summary = ''

    // Extract summary based on provider's response format
    switch (apiSettings.provider) {
      case 'openai':
      case 'mistral':
        summary = data.choices[0].message.content
        break
      case 'anthropic':
        summary = data.content[0].text
        break
    }

    if (!summary) {
      return NextResponse.json(
        { error: 'Invalid response format from AI provider' },
        { status: 500 }
      )
    }

    return NextResponse.json({ summary })
  } catch (error: unknown) {
    console.error('Error in summarize API:', error)
    return NextResponse.json(
      { error: 'Failed to summarize text' },
      { status: 500 }
    )
  }
}

