/**
 * Export utilities for CV downloads
 */



// PDF Export using browser print API
export const exportToPDF = async (elementId: string, filename: string = 'cv.pdf') => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Element not found')
    }

    // Create a new window with the CV content
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Failed to open print window')
    }

    // Clone the content and styles
    const clonedContent = element.cloneNode(true) as HTMLElement
    
    // Get all styles
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n')
        } catch (e) {
          return ''
        }
      })
      .join('\n')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>CV Export</title>
          <style>
            ${styles}
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif;
              background: white;
            }
            @media print {
              body { 
                margin: 0; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${clonedContent.innerHTML}
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Trigger print dialog
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)

    return { success: true, message: 'PDF export initiated' }
  } catch (error) {
    console.error('PDF export error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during PDF export'
    return { success: false, error: errorMessage }
  }
}

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
    console.log('Request payload size:', JSON.stringify({ html: htmlContent }).length);
    
    try {
      const testResponse = await fetch('https://backendserver.resumaic.com', { method: 'HEAD' });
      console.log('Server reachable:', testResponse.ok);
    } catch (testError) {
      console.error('Server not reachable:', testError);
    }
    
    const response = await fetch('https://backendserver.resumaic.com/api/export-docx', {
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
