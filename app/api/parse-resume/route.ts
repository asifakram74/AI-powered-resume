// app/api/parse-resume/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Updated schema to match your exact CVData format
const resumeSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().optional().default(""),
    jobTitle: z.string().optional().default(""),
    email: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    address: z.string().optional().default(""),
    city: z.string().optional().default(""),
    country: z.string().optional().default(""),
    profilePicture: z.string().optional().default(""),
    summary: z.string().optional().default(""),
    linkedin: z.string().optional().default(""),
    github: z.string().optional().default("")
  }),
  experience: z.array(z.object({
    jobTitle: z.string().optional().default(""),
    companyName: z.string().optional().default(""),
    location: z.string().optional().default(""),
    startDate: z.string().optional().default(""),
    endDate: z.string().optional().default(""),
    current: z.boolean().optional().default(false),
    responsibilities: z.array(z.string()).optional().default([])
  })).optional().default([]),
  education: z.array(z.object({
    degree: z.string().optional().default(""),
    institutionName: z.string().optional().default(""),
    location: z.string().optional().default(""),
    graduationDate: z.string().optional().default(""),
    gpa: z.string().optional().default(""),
    honors: z.string().optional().default(""),
    additionalInfo: z.string().optional().default("")
  })).optional().default([]),
  skills: z.object({
    technical: z.array(z.string()).optional().default([]),
    soft: z.array(z.string()).optional().default([])
  }).optional().default({ technical: [], soft: [] }),
  languages: z.array(z.object({
    name: z.string().optional().default(""),
    proficiency: z.enum(["Native", "Fluent", "Advanced", "Intermediate", "Basic"]).optional().default("Intermediate")
  })).optional().default([]),
  certifications: z.array(z.object({
    title: z.string().optional().default(""),
    issuingOrganization: z.string().optional().default(""),
    dateObtained: z.string().optional().default(""),
    verificationLink: z.string().optional().default("")
  })).optional().default([]),
  projects: z.array(z.object({
    name: z.string().optional().default(""),
    role: z.string().optional().default("Developer"),
    description: z.string().optional().default(""),
    technologies: z.array(z.string()).optional().default([]),
    liveDemoLink: z.string().optional().default(""),
    githubLink: z.string().optional().default("")
  })).optional().default([]),
  additional: z.object({
    interests: z.array(z.string()).optional().default([])
  }).optional().default({ interests: [] })
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

    // Construct the prompt for DeepSeek with explicit instructions
    const prompt = `Analyze the following resume text and extract structured information. 
    Return ONLY a JSON object with the following EXACT structure. If information is missing, try to infer reasonable values or leave them as empty strings/arrays:

    {
      "personalInfo": {
        "fullName": "string",
        "jobTitle": "string",
        "email": "string",
        "phone": "string",
        "address": "string",
        "city": "string",
        "country": "string",
        "profilePicture": "string",
        "summary": "string",
        "linkedin": "string",
        "github": "string"
      },
      "experience": [{
        "jobTitle": "string",
        "companyName": "string",
        "location": "string",
        "startDate": "string (MM/YYYY format)",
        "endDate": "string (MM/YYYY format or 'Present')",
        "current": "boolean",
        "responsibilities": ["string", "string"]
      }],
      "education": [{
        "degree": "string",
        "institutionName": "string",
        "location": "string",
        "graduationDate": "string (YYYY or MM/YYYY)",
        "gpa": "string",
        "honors": "string",
        "additionalInfo": "string"
      }],
      "skills": {
        "technical": ["string", "string"],
        "soft": ["string", "string"]
      },
      "languages": [{
        "name": "string",
        "proficiency": "Native/Fluent/Advanced/Intermediate/Basic"
      }],
      "certifications": [{
        "title": "string",
        "issuingOrganization": "string",
        "dateObtained": "string (MM/YYYY)",
        "verificationLink": "string"
      }],
      "projects": [{
        "name": "string",
        "role": "string (e.g., Developer, Lead, Contributor)",
        "description": "string",
        "technologies": ["string", "string"],
        "liveDemoLink": "string",
        "githubLink": "string"
      }],
      "additional": {
        "interests": ["string", "string"]
      }
    }

    IMPORTANT INSTRUCTIONS:
    1. Return ONLY the JSON object, no other text
    2. For projects: If only name and description are available, try to infer technologies based on the description
    3. For missing fields: Use empty strings for text, empty arrays for lists, false for booleans
    4. For dates: Use consistent MM/YYYY format where possible
    5. For proficiency levels: Use only "Native", "Fluent", "Advanced", "Intermediate", or "Basic"
    6. For technologies: Infer from project descriptions if not explicitly mentioned
    7. For role in projects: Use "Developer" as default if not specified

    Resume Text:
    ${extractedText}`;

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
            content: `You are an expert resume parser. Extract structured information from resumes with high accuracy.
            Always return data in the exact JSON format specified, even if some fields are empty.
            For projects: Always include name, role, description, technologies, liveDemoLink, and githubLink.
            If technologies are not mentioned, infer them from the project description.
            If role is not specified, use "Developer" as default.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1, // Low temperature for consistent output
        max_tokens: 4000, // Increased for larger JSON response
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
      console.error("Raw API response:", content);
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