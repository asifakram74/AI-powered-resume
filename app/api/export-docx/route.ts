import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json()
    
    // For now, return a simple response indicating DOCX export is not implemented
    // In a real implementation, you would use a library like html-docx-js or similar
    return NextResponse.json(
      { error: 'DOCX export not implemented yet' },
      { status: 501 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process DOCX export' },
      { status: 500 }
    )
  }
} 