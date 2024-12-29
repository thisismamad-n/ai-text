import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { text, apiKey, provider } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key provided' },
        { status: 400 }
      )
    }

    let endpoint: string
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    let body: any

    switch (provider) {
      case 'mistral':
        endpoint = 'https://api.mistral.ai/v1/chat/completions'
        headers['Authorization'] = `Bearer ${apiKey}`
        body = {
          model: 'mistral-tiny',
          messages: [
            {
              role: 'system',
              content: 'You are a professional editor. Your task is to check the text for grammar, spelling, and style issues. Provide corrections and explanations in a clear, concise format.'
            },
            {
              role: 'user',
              content: `Please check this text for grammar and style issues: "${text}"`
            }
          ]
        }
        break

      case 'openai':
        endpoint = 'https://api.openai.com/v1/chat/completions'
        headers['Authorization'] = `Bearer ${apiKey}`
        body = {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional editor. Your task is to check the text for grammar, spelling, and style issues. Provide corrections and explanations in a clear, concise format.'
            },
            {
              role: 'user',
              content: `Please check this text for grammar and style issues: "${text}"`
            }
          ]
        }
        break

      case 'anthropic':
        endpoint = 'https://api.anthropic.com/v1/messages'
        headers['x-api-key'] = apiKey
        headers['anthropic-version'] = '2023-06-01'
        body = {
          model: 'claude-2',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Please check this text for grammar and style issues: "${text}"`
            }
          ],
          system: 'You are a professional editor. Your task is to check the text for grammar, spelling, and style issues. Provide corrections and explanations in a clear, concise format.'
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid AI provider selected' },
          { status: 400 }
        )
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('AI API error:', error)
      throw new Error('Failed to check grammar')
    }

    const data = await response.json()
    let result = ''

    // Extract the response based on the provider's response format
    if (provider === 'anthropic') {
      result = data.content[0].text
    } else {
      result = data.choices[0].message.content
    }

    return NextResponse.json({ result })
  } catch (error: unknown) {
    console.error('Error in grammar check:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check grammar' },
      { status: 500 }
    )
  }
} 