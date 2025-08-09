import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const coverLetterResponseSchema = z.object({
  coverLetter: z.string(),
  keywords: z.array(z.string()),
  strengths: z.array(z.string()),
  suggestions: z.array(z.string()),
  tone: z.string(),
  score: z.number().min(0).max(100)
})

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    const jobDescription = requestBody.jobDescription || ""
    const cvContent = requestBody.cvContent || ""
    const tone = requestBody.tone || "professional"
    const cvData = requestBody.cvData || {}

    if (!jobDescription || !cvContent) {
      return NextResponse.json(
        { error: "Job description and CV content are required" },
        { status: 400 }
      )
    }

    // Create the prompt for DeepSeek
    const prompt = `You are an expert cover letter writer. Create a compelling, personalized cover letter based on the provided job description and CV.

JOB DESCRIPTION:
${jobDescription}

CV CONTENT:
${cvContent}

TONE: ${tone}

CV DATA:
${JSON.stringify(cvData, null, 2)}

INSTRUCTIONS:
1. Create a personalized cover letter that directly addresses the job requirements
2. Highlight relevant skills and experiences from the CV
3. Use the specified tone throughout
4. Include specific keywords from the job description
5. Make it engaging and professional
6. Address the hiring manager directly
7. Include a strong call to action

RESPONSE FORMAT (JSON ONLY):
{
  "coverLetter": "Complete cover letter text here...",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "tone": "professional",
  "score": 85
}`

    const apiKey = process.env.DEEPSEEK_API_KEY || "sk-31feec972d0048678eb0fc4ad1061e87"
    if (!apiKey) {
      throw new Error("DeepSeek API key not configured")
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are an expert cover letter writer who creates compelling, personalized cover letters that get results.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DeepSeek API error: ${errorText}`)
    }

    const data = await response.json()
    const text = data.choices[0]?.message?.content || ""
    
    // Parse the JSON response
    let parsedResponse
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }
      parsedResponse = coverLetterResponseSchema.parse(JSON.parse(jsonMatch[0]))
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      
      // Fallback response
      parsedResponse = {
        coverLetter: generateFallbackCoverLetter(jobDescription, cvContent, tone),
        keywords: extractKeywords(jobDescription),
        strengths: ["Strong communication skills", "Relevant experience", "Technical expertise"],
        suggestions: ["Add more specific examples", "Include quantifiable achievements"],
        tone: tone,
        score: 75
      }
    }

    return NextResponse.json(parsedResponse)
  } catch (error: any) {
    console.error("Cover Letter Generation Error:", error)
    
    // Return fallback response on error
    const fallback = {
      coverLetter: generateFallbackCoverLetter("", "", "professional"),
      keywords: [],
      strengths: ["Strong background", "Good fit for role"],
      suggestions: ["Review and customize"],
      tone: "professional",
      score: 70
    }
    
    return NextResponse.json(fallback, { status: 200 })
  }
}

function generateFallbackCoverLetter(jobDesc: string, cvContent: string, tone: string) {
  const tones = {
    professional: "I am writing to express my strong interest in this position...",
    enthusiastic: "I am thrilled to apply for this exciting opportunity...",
    confident: "With my proven track record, I am confident...",
    friendly: "I would love the opportunity to contribute...",
    creative: "Your company's innovative approach resonates..."
  }

  const opening = tones[tone as keyof typeof tones] || tones.professional
  
  return `${opening}

I am excited about the opportunity to bring my skills and experience to your team. My background includes relevant experience that aligns well with the position requirements.

Key qualifications I would bring:
• Strong technical skills and relevant experience
• Proven ability to deliver results
• Excellent communication and collaboration skills

I look forward to discussing how I can contribute to your team's success.

Sincerely,
[Your Name]`
}

function extractKeywords(text: string): string[] {
  const commonKeywords = ["experience", "skills", "team", "project", "results", "communication", "technical", "leadership"]
  return commonKeywords.filter(keyword => text.toLowerCase().includes(keyword))
}
