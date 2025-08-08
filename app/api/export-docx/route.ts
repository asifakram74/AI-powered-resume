import { NextRequest, NextResponse } from 'next/server'
import htmlDocx from 'html-docx-js/dist/html-docx'

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json()

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      )
    }

    // Convert HTML to DOCX Blob
    const docxBlob = htmlDocx.asBlob(html)

    // Convert Blob to Buffer
    const arrayBuffer = await docxBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Return the file as base64 for client-side download
    const base64 = buffer.toString('base64')

    return NextResponse.json({
      success: true,
      data: base64,
      filename: `cv-${Date.now()}.docx`,
    })
  } catch (error) {
    console.error('DOCX export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate DOCX' },
      { status: 500 }
    )
  }
}
