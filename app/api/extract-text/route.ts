import { NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import * as mammoth from 'mammoth'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Log file details for debugging
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    let text = ''

    if (file.name.toLowerCase().endsWith('.txt')) {
      // For .txt files, just decode the buffer
      text = buffer.toString('utf-8')
      console.log('Processing TXT file')
    } else if (file.name.toLowerCase().endsWith('.pdf')) {
      // For PDF files
      console.log('Processing PDF file')
      try {
        const pdfData = await pdfParse(buffer)
        text = pdfData.text
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError)
        throw new Error('Failed to parse PDF file')
      }
    } else if (
      file.name.toLowerCase().endsWith('.doc') ||
      file.name.toLowerCase().endsWith('.docx')
    ) {
      // For Word documents
      console.log('Processing Word document')
      try {
        const result = await mammoth.extractRawText({ arrayBuffer: bytes })
        if (result && result.value) {
          text = result.value
          console.log('Word document processed successfully')
        } else {
          console.error('No text content found in Word document')
          throw new Error('No text content found in Word document')
        }
      } catch (docError) {
        console.error('Word document parsing error:', docError)
        throw new Error('Failed to parse Word document. Please ensure it is a valid .docx file.')
      }
    } else {
      throw new Error(`Unsupported file type: ${file.name}`)
    }

    if (!text) {
      console.error('No text extracted from file')
      throw new Error('No text could be extracted from the document')
    }

    console.log('Text extracted successfully')
    return NextResponse.json({ text })
  } catch (error: unknown) {
    console.error('Error in API route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract text from document'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 