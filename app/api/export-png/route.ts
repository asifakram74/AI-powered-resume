import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json()
    
    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      )
    }

    // For PNG export, we'll use a client-side approach
    // This endpoint serves as a placeholder for consistency
    return NextResponse.json({
      success: true,
      message: 'PNG export should be handled client-side using html2canvas',
      html: html
    })
    
  } catch (error) {
    console.error('PNG export error:', error)
    return NextResponse.json(
      { error: 'Failed to process PNG export' },
      { status: 500 }
    )
  }
}
