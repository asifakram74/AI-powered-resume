import { NextApiRequest, NextApiResponse } from 'next';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { html } = req.body;
    
    // Convert HTML to DOCX - this is a basic example
    // You'll need to implement proper HTML to DOCX conversion
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Your CV Content",
                  bold: true,
                }),
              ],
            }),
            // Add more content here based on the HTML
          ],
        },
      ],
    });

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