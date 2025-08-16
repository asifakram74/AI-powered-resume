import { NextApiRequest, NextApiResponse } from 'next';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, SectionType, ISectionOptions } from 'docx';
import { JSDOM } from 'jsdom';

// Helper type for document children
type DocChild = Paragraph;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { html } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Parse HTML to extract content
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Create document children array
    const docChildren: DocChild[] = [];

    // Create a new Document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    // Helper function to convert HTML to docx elements
    const processElement = (element: Element) => {
      const children: any[] = [];
      
      // Process child nodes
      for (const node of Array.from(element.childNodes)) {
        if (node.nodeType === node.TEXT_NODE) {
          if (node.textContent?.trim()) {
            children.push(
              new TextRun({
                text: node.textContent,
                bold: element.tagName === 'STRONG' || element.tagName === 'B',
                italics: element.tagName === 'EM' || element.tagName === 'I',
                size: 24, // Default font size
              })
            );
          }
        } else if (node.nodeType === node.ELEMENT_NODE) {
          const childElement = node as Element;
          
          // Handle different HTML elements
          if (childElement.tagName === 'P') {
            children.push(
              new Paragraph({
                children: processElement(childElement),
                spacing: { after: 100 },
              })
            );
          } else if (childElement.tagName === 'H1') {
            children.push(
              new Paragraph({
                text: childElement.textContent || '',
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 200, after: 100 },
              })
            );
          } else if (childElement.tagName === 'H2') {
            children.push(
              new Paragraph({
                text: childElement.textContent || '',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 150, after: 100 },
              })
            );
          } else if (childElement.tagName === 'LI') {
            children.push(
              new Paragraph({
                text: '• ' + (childElement.textContent || ''),
                indent: { left: 400 },
                spacing: { after: 50 },
              })
            );
          } else {
            // Recursively process other elements
            children.push(...processElement(childElement));
          }
        }
      }
      
      return children;
    };

    // Process the main content and add to document
    const content = document.querySelector('body') || document.documentElement;
    const docElements = processElement(content);
    
    // Add all elements to the document children
    docChildren.push(...docElements);

    // Generate the DOCX file
    const buffer = await Packer.toBuffer(doc);

    // Set the appropriate headers
    res.setHeader('Content-Disposition', 'attachment; filename=cv.docx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    
    // Send the file
    return res.send(buffer);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return res.status(500).json({ error: 'Failed to generate DOCX file' });
  }
}