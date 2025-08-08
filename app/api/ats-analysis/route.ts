// app/api/ats-analysis/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const analysisResponseSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  keywords: z.object({
    matched: z.array(z.string()),
    missing: z.array(z.string())
  }),
  sections: z.record(z.object({
    score: z.number().min(0).max(100),
    feedback: z.string()
  }))
})

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    const extractedText = requestBody.extractedText || ""
    const jobDescription = requestBody.jobDescription || ""

    if (!extractedText || !jobDescription) {
      return NextResponse.json(
        { error: "Both extracted text and job description are required" },
        { status: 400 }
      )
    }

    // Create the prompt for DeepSeek
    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Your task is to evaluate the provided resume text against the job description and provide a detailed analysis.

Job Description:
${jobDescription}

Resume Text:
${extractedText}

Analysis Requirements:
1. Score the resume's ATS compatibility (0-100)
2. List 3-5 strengths
3. List 3-5 weaknesses
4. Provide 5-7 specific improvement suggestions
5. Identify matched and missing keywords
6. Evaluate key sections (Contact, Summary, Experience, Skills, Education, Formatting)

Response Format (JSON ONLY):
{
  "score": 85,
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "keywords": {
    "matched": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"]
  },
  "sections": {
    "Contact Information": {"score": 95, "feedback": "Complete"},
    "Professional Summary": {"score": 80, "feedback": "Could be stronger"},
    "Work Experience": {"score": 85, "feedback": "Good details"},
    "Skills": {"score": 75, "feedback": "Missing some"},
    "Education": {"score": 90, "feedback": "Well presented"},
    "Formatting": {"score": 88, "feedback": "Clean"}
  }
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
            content: "You are a helpful assistant that specializes in resume optimization and ATS analysis.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
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
      parsedResponse = analysisResponseSchema.parse(JSON.parse(jsonMatch[0]))
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      throw new Error("Failed to parse AI response")
    }

    return NextResponse.json(parsedResponse)
  } catch (error: any) {
    console.error("ATS Analysis Error:", error)
    return NextResponse.json(
      { error: error.message || "ATS analysis failed" },
      { status: 500 }
    )
  }
}