// app/api/parse-resume/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for DeepSeek response validation
const resumeSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().optional(),
    jobTitle: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    summary: z.string().optional(),
  }),
  experience: z.array(
    z.object({
      jobTitle: z.string(),
      company: z.string(),
      duration: z.string().optional(),
      description: z.string().optional(),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string().optional(),
    })
  ),
  skills: z.array(z.string()),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { extractedText } = await request.json();

    if (!extractedText) {
      return NextResponse.json(
        { error: "Extracted text is required" },
        { status: 400 }
      );
    }

    // Construct the prompt for DeepSeek
    const prompt = `Analyze the following resume text and extract structured information. 
    Return ONLY a JSON object with the following structure:
    {
      "personalInfo": {
        "fullName": string,
        "jobTitle": string,
        "email": string,
        "phone": string,
        "address": string,
        "summary": string
      },
      "experience": [{
        "jobTitle": string,
        "company": string,
        "duration": string,
        "description": string
      }],
      "education": [{
        "degree": string,
        "institution": string,
        "year": string
      }],
      "skills": string[],
      "certifications": string[],
      "languages": string[]
    }

    Resume Text:
    ${extractedText}

    Important:
    - Extract all available information
    - Format dates consistently (MM/YYYY)
    - Clean and normalize all text
    - Return ONLY the JSON object`;

    const apiKey = process.env.DEEPSEEK_API_KEY || "sk-31feec972d0048678eb0fc4ad1061e87";
    if (!apiKey) {
      throw new Error("DeepSeek API key not configured");
    }

    // Call DeepSeek API
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are an expert resume parser. Extract structured information from resumes with high accuracy.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1, // Low temperature for consistent output
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from DeepSeek");
    }

    // Parse and validate the response
    let parsedData;
    try {
      parsedData = resumeSchema.parse(JSON.parse(content));
    } catch (error) {
      console.error("Validation error:", error);
      throw new Error("Failed to validate DeepSeek response");
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse resume" },
      { status: 500 }
    );
  }
}