/**
 * Export utilities for CV downloads
 */


// PNG Export using html2canvas (would need to be installed)
export const exportToPNG = async (elementId: string, filename: string = 'cv.png') => {
  try {
    // This would require html2canvas library
    // For now, return a placeholder message
    return { 
      success: false, 
      error: 'PNG export requires html2canvas library. Please install it: npm install html2canvas' 
    }
  } catch (error) {
    console.error('PNG export error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during PNG export'
    return { success: false, error: errorMessage }
  }
}

// DOCX Export using server API
export const exportToDOCX = async (htmlContent: string, filename: string = 'cv.docx') => {
  try {
    console.log('Making request to:', 'https://backendserver.resumaic.com/api/export-docx');
    // console.log('Making request to:', 'https://stagingnode.resumaic.com/api/export-docx');
    console.log('Request payload size:', JSON.stringify({ html: htmlContent }).length);
    
    try {
      const testResponse = await fetch('https://backendserver.resumaic.com', { method: 'HEAD' });
      // const testResponse = await fetch('https://stagingnode.resumaic.com', { method: 'HEAD' });
      console.log('Server reachable:', testResponse.ok);
    } catch (testError) {
      console.error('Server not reachable:', testError);
    }
    
    const response = await fetch('https://backendserver.resumaic.com/api/export-docx', {
    // const response = await fetch('https://stagingnode.resumaic.com/api/export-docx', {
      method: 'POST',
    headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
      html: htmlContent,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('DOCX export error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during DOCX export'
    return { success: false, error: errorMessage }
  }
}

// Helper function to get CV HTML content
export const getCVHTMLContent = (elementId: string): string => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('CV element not found')
  }
  return element.outerHTML
}

// New: Wrap inner HTML with Tailwind and inline styles for Browserless
export const wrapHtmlWithStyles = (innerHTML: string): string => {
  // Collect accessible styles from the current page (best-effort)
  const inlineStyles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from((sheet as CSSStyleSheet).cssRules)
          .map(rule => rule.cssText)
          .join('\n')
      } catch {
        return ''
      }
    })
    .join('\n')

  const googleFonts = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  `

  // Use Tailwind CDN so classes render when Browserless loads this HTML
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CV Export</title>
    ${googleFonts}
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      ${inlineStyles}
      :root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      @media print {
        @page { size: A4; margin: 0; }
        .cv-measure { display: none !important; }
        .print\\:break-inside-avoid { break-inside: avoid; }
        .print\\:break-before-page { break-before: page; }
        .print\\:break-after-avoid { break-after: avoid; }
        .print\\:shadow-none { box-shadow: none; }
        .print\\:min-h-0 { min-height: 0; }
      }
    </style>
  </head>
  <body class="bg-white m-0 p-0">
    <div id="cv-export-root" class="m-0 p-0">${innerHTML}</div>
  </body>
</html>`
}

// Download helper
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ===== Browserless.io Export Utilities =====
const BROWSERLESS_TOKEN = process.env.NEXT_PUBLIC_BROWSERLESS_TOKEN || ''
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'https://backendserver.resumaic.com'

export const exportToPDFViaBrowserless = async (
htmlContent: string,
  filename: string = 'cv.pdf',
  _token: string = BROWSERLESS_TOKEN
) => {
  try {
    const endpoint = `${BACKEND_BASE_URL}/api/cv-export/pdf`
    const response = await fetch(endpoint, {
      method: 'POST',
    headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html: htmlContent, filename }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Backend PDF error: ${response.status} ${text}`)
    }

    const buffer = await response.arrayBuffer()
    const blob = new Blob([buffer], { type: 'application/pdf' })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    console.error('Backend PDF export error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during Backend PDF export'
    return { success: false, error: errorMessage }
  }
}

export const exportToPNGViaBrowserless = async (
htmlContent: string,
  filename: string = 'cv.png',
  _token: string = BROWSERLESS_TOKEN
) => {
  try {
    const endpoint = `${BACKEND_BASE_URL}/api/cv-export/png`
    const response = await fetch(endpoint, {
      method: 'POST',
    headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html: htmlContent, filename }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Backend PNG error: ${response.status} ${text}`)
    }

    const buffer = await response.arrayBuffer()
    const blob = new Blob([buffer], { type: 'image/png' })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    console.error('Backend PNG export error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during Backend PNG export'
    return { success: false, error: errorMessage }
  }
}
