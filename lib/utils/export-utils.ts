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
    console.log('Making request to:', '  https://backendserver.resumaic.com/api/export-docx');
    console.log('Request payload size:', JSON.stringify({ html: htmlContent }).length);
    
    try {
      const testResponse = await fetch('  https://backendserver.resumaic.com', { method: 'HEAD' });
      console.log('Server reachable:', testResponse.ok);
    } catch (testError) {
      console.error('Server not reachable:', testError);
    }
    
    const response = await fetch('  https://backendserver.resumaic.com/api/export-docx', {
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

// Universal wrapper that preserves existing layouts
export const wrapHtmlWithStyles = (innerHTML: string): string => {
  const googleFonts = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  `

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CV Export</title>
    ${googleFonts}
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Minimal reset that doesn't break existing layouts */
      body {
        margin: 0;
        padding: 0;
        font-family: 'Inter', sans-serif;
      }
      
      /* Print styles - only add page margins, don't touch content */
      @media print {
        @page {
          margin: 25px; /* Page-level padding only */
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        
        /* Preserve all existing layouts */
        .cv-export-root {
          margin: 0;
          padding: 0;
          width: 100%;
        }
        
        /* Page break helpers that don't affect layout */
        .page-break {
          page-break-before: always;
        }
        
        .avoid-break {
          page-break-inside: avoid;
        }
      }
      
      /* Screen preview - minimal safe padding */
      @media screen {
        body {
          background: #f3f4f6;
          padding: 1rem;
          display: flex;
          justify-content: center;
        }
        
        .cv-export-root {
          background: white;
          margin: 0 auto;
          max-width: 210mm;
          min-height: 297mm;
          width: 100%;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          border-radius: 8px;
          /* No padding here - let the original CV content handle its own spacing */
        }
      }
    </style>
  </head>
  <body>
    <div class="cv-export-root">
      ${innerHTML}
    </div>
  </body>
</html>`
}

// Smart PDF wrapper that preserves template layouts
export const wrapHtmlForPDF = (innerHTML: string): string => {
  const googleFonts = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  `

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CV Export</title>
    ${googleFonts}
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Smart reset - only reset body, preserve all other styles */
      body {
        margin: 0;
        padding: 0;
        font-family: 'Inter', sans-serif;
      }
      
      /* PDF/Print styles - minimal interference */
      @media print {
        /* Page margins only - don't touch content layout */
        @page {
          size: A4;
          margin: 25px; /* 25px safe area around content */
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          background: white !important;
        }
        
        /* Container that preserves original CV layout */
        .pdf-safe-container {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          /* No additional padding - let CV template handle its own spacing */
        }
        
        /* Safe page break helpers */
        .page-break-before {
          page-break-before: always;
        }
        
        .page-break-after {
          page-break-after: always;
        }
        
        .avoid-break-inside {
          page-break-inside: avoid;
        }
      }
      
      /* Screen preview - show safe area without breaking layout */
      @media screen {
        body {
          background: #f3f4f6;
          padding: 1rem;
          display: flex;
          justify-content: center;
          min-height: 100vh;
        }
        
        .pdf-safe-container {
          background: white;
          margin: 0 auto;
          max-width: 210mm;
          min-height: 297mm;
          width: 100%;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          /* Critical: No padding here to preserve template layouts */
        }
        
        /* Visual indicator of safe area */
        .pdf-safe-container::before {
          content: '';
          position: absolute;
          top: 25px;
          left: 25px;
          right: 25px;
          bottom: 25px;
          border: 1px dashed #e5e7eb;
          pointer-events: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="pdf-safe-container">
      ${innerHTML}
    </div>
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
    // Use the smart wrapper that preserves layouts
    const styledHtml = wrapHtmlForPDF(htmlContent);
    
    const endpoint = `${BACKEND_BASE_URL}/api/cv-export/pdf`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        html: styledHtml, 
        filename,
        options: {
          format: 'A4',
          printBackground: true,
          margin: {
            top: '25px',    // 25px page margin
            right: '25px',  // 25px page margin
            bottom: '25px', // 25px page margin
            left: '25px'    // 25px page margin
          },
          displayHeaderFooter: false,
          preferCSSPageSize: true
        }
      }),
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
    // Use the same smart wrapper for PNG
    const styledHtml = wrapHtmlForPDF(htmlContent);
    
    const endpoint = `${BACKEND_BASE_URL}/api/cv-export/png`

    const payload = {
      html: styledHtml,
      filename,
      options: {
        type: 'png',
        fullPage: true,
        omitBackground: false,
      },
      viewport: {
        width: 1240,
        height: 1754,
        deviceScaleFactor: 2,
      },
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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

// Template-safe wrapper for any CV layout
export const wrapHtmlTemplateSafe = (innerHTML: string): string => {
  const googleFonts = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  `

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CV Export</title>
    ${googleFonts}
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Absolute minimum reset */
      body {
        margin: 0;
        padding: 0;
      }
      
      @page {
        margin: 25px; /* Safe area only */
      }
      
      @media print {
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .template-safe-wrapper {
          margin: 0;
          padding: 0;
          width: 100%;
        }
      }
      
      @media screen {
        body {
          background: #f3f4f6;
          padding: 1rem;
        }
        
        .template-safe-wrapper {
          background: white;
          margin: 0 auto;
          max-width: 210mm;
          min-height: 297mm;
          width: 100%;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
      }
    </style>
  </head>
  <body>
    <div class="template-safe-wrapper">
      ${innerHTML}
    </div>
  </body>
</html>`
}