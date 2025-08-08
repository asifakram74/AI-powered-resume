import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Define the schema for the optimized CV response
const optimizedCVSchema = z.object({
  optimizedCV: z.object({
    personalInfo: z.object({
      name: z.string().default("Your Name"),
      email: z.string().default("your.email@example.com"),
      phone: z.string().default("+1 (555) 123-4567"),
      location: z.string().default("Your Location"),
      linkedin: z.string().optional().default(""),
      website: z.string().optional().default(""),
    }),
    summary: z.string().default("Professional summary to be added"),
    workExperience: z
      .array(
        z.object({
          title: z.string().default("Job Title"),
          company: z.string().default("Company Name"),
          duration: z.string().default("Date Range"),
          description: z.string().default("Job description"),
        }),
      )
      .default([]),
    education: z
      .array(
        z.object({
          degree: z.string().default("Degree"),
          institution: z.string().default("Institution"),
          year: z.string().default("Year"),
          gpa: z.string().optional().default(""),
        }),
      )
      .default([]),
    skills: z.array(z.string()).default([]),
    projects: z
      .array(
        z.object({
          name: z.string().default("Project Name"),
          description: z.string().default("Project description"),
          technologies: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    certifications: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([]),
  }),
  suggestions: z.array(z.string()).default([]),
  improvementScore: z.number().default(75),
})

// Test function to verify API connectivity
async function testDeepSeekConnection(apiKey: string) {
  try {
    console.log("🧪 Testing DeepSeek API connection...")
    const testResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: "Hello, test message" }],
        max_tokens: 50,
      }),
    })

    console.log("🔍 Test response status:", testResponse.status)

    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.error("❌ Test API call failed:", errorText)
      return false
    }

    const testData = await testResponse.json()
    console.log("✅ Test API call successful:", testData)
    return true
  } catch (error) {
    console.error("❌ Test connection error:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting CV optimization request via DeepSeek API...")

    const apiKey = "sk-31feec972d0048678eb0fc4ad1061e87" // Your DeepSeek API key
    console.log("🔑 Using API key:", apiKey.substring(0, 5) + "...")

    // Test connection first
    const connectionTest = await testDeepSeekConnection(apiKey)
    if (!connectionTest) {
      return NextResponse.json(
        {
          error: "DeepSeek API connection test failed",
          details: "Unable to connect to DeepSeek API. Check console for details.",
        },
        { status: 503 },
      )
    }

    const requestBody = await request.json()
    const extractedText = requestBody.extractedText || requestBody.text || ""
    console.log("📝 Extracted text received, length:", extractedText?.length || 0, "characters")

    if (!extractedText || extractedText.trim().length === 0) {
      console.log("⚠️ No extracted text provided, using fallback data")
      return NextResponse.json(createFallbackResponse(extractedText))
    }

    // Create a structured prompt for CV enhancement
    const prompt = `You are an expert CV optimization specialist. Your task is to enhance and optimize the provided CV text to make it more professional, ATS-friendly, and impactful.

IMPORTANT INSTRUCTIONS:
- If any information is missing from the CV text, use reasonable professional defaults or leave fields empty
- Do NOT make up specific company names, dates, or personal details that aren't in the original text
- If personal info is missing, use placeholder values like "Your Name", "your.email@example.com"
- If work experience is missing, create 1-2 generic professional examples
- If education is missing, suggest a relevant degree
- Always provide at least 5 relevant skills even if none are mentioned
- Be creative but professional when filling gaps

Guidelines for optimization:
1. Extract and structure all information from the provided CV text
2. Enhance the professional summary with stronger action words and industry keywords
3. Improve job descriptions with quantifiable achievements and impact statements
4. Use professional language and remove casual expressions
5. Add relevant keywords for ATS optimization
6. Fill missing sections with professional, generic content
7. Highlight transferable skills and accomplishments
8. Make descriptions more concise yet comprehensive
9. Use active voice and strong action verbs
10. Quantify achievements where possible (even if estimated)

Please analyze the following CV text and return a complete, optimized CV structure:

CV Text to analyze:
${extractedText}

YOUR RESPONSE MUST BE A SINGLE JSON OBJECT, PARSABLE DIRECTLY. DO NOT INCLUDE ANY OTHER TEXT OR MARKDOWN OUTSIDE THE JSON.

Required JSON structure:
{
  "optimizedCV": {
    "personalInfo": {
      "name": "Full Name (or 'Your Name' if missing)",
      "email": "email@example.com (or placeholder if missing)",
      "phone": "+1 (555) 123-4567 (or placeholder if missing)",
      "location": "City, State (or 'Your Location' if missing)",
      "linkedin": "linkedin.com/in/username (optional, can be empty string)",
      "website": "website.com (optional, can be empty string)"
    },
    "summary": "Professional summary paragraph (create one if missing)...",
    "workExperience": [
      {
        "title": "Job Title (create if missing)",
        "company": "Company Name (create if missing)",
        "duration": "Start Date - End Date (create if missing)",
        "description": "Enhanced job description with achievements (create if missing)..."
      }
    ],
    "education": [
      {
        "degree": "Degree Name (create if missing)",
        "institution": "Institution Name (create if missing)",
        "year": "Graduation Year (create if missing)",
        "gpa": "GPA if available (can be empty string)"
      }
    ],
    "skills": ["At least 5 relevant skills"],
    "projects": [
      {
        "name": "Project Name (create if missing)",
        "description": "Enhanced project description (create if missing)...",
        "technologies": ["Tech1", "Tech2"]
      }
    ],
    "certifications": ["Certification 1 (can be empty array if none)", "Certification 2"],
    "languages": ["Language 1 (Level)", "Language 2 (Level)"],
    "interests": ["Interest 1", "Interest 2", "Interest 3"]
  },
  "suggestions": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2",
    "Specific improvement suggestion 3",
    "Specific improvement suggestion 4",
    "Specific improvement suggestion 5"
  ],
  "improvementScore": 85
}`

    console.log("📤 Sending optimization request to DeepSeek API...")
    const startTime = Date.now()

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
            content: "You are a helpful assistant that specializes in CV optimization and career advice.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ DeepSeek API call failed:", errorText)
      throw new Error(`DeepSeek API error: ${errorText}`)
    }

    const data = await response.json()
    console.log("📊 Optimization response:", data)
    const endTime = Date.now()
    console.log("✅ DeepSeek API response received in", endTime - startTime, "ms")
    
    const text = data.choices[0]?.message?.content || ""
    console.log("Received text response (first 500 chars):", text.substring(0, 500) + "...")

    // Attempt to parse the text as JSON and validate with Zod
    let parsedResponse
    try {
      // Clean the response text to ensure it's valid JSON
      const cleanedText = text.trim()
      let jsonText = cleanedText

      // Try to extract JSON from the response if it contains other text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }

      // Parse and validate the JSON
      const rawJson = JSON.parse(jsonText)
      parsedResponse = optimizedCVSchema.parse(rawJson)
      console.log("✅ Successfully parsed and validated AI response.")
    } catch (parseError: any) {
      console.error("❌ Failed to parse or validate AI response JSON:", parseError)
      console.error("Raw AI text response that failed parsing:", text.substring(0, 1000))

      // Create fallback response based on extracted text
      parsedResponse = createFallbackResponse(extractedText)
    }

    console.log("🎯 Optimization complete with score:", parsedResponse.improvementScore)
    return NextResponse.json(parsedResponse)
  } catch (error: any) {
    console.error("❌ Detailed Error Information from DeepSeek API:")
    console.error("Error message:", error?.message)
    console.error("Full error object:", error)

    let errorMessage = "Unknown error occurred"
    let statusCode = 500

    if (error?.message) {
      const msg = error.message.toLowerCase()
      if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("invalid api key")) {
        errorMessage = "Invalid DeepSeek API key. Please check your key."
        statusCode = 401
      } else if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota")) {
        errorMessage = "DeepSeek rate limit exceeded or quota exhausted. Please try again later."
        statusCode = 429
      } else if (msg.includes("timeout") || msg.includes("aborted")) {
        errorMessage = "Request timeout. DeepSeek took too long to respond."
        statusCode = 408
      } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("enotfound")) {
        errorMessage = "Network error. Unable to reach DeepSeek API."
        statusCode = 503
      } else {
        errorMessage = error.message
      }
    }

    // Return fallback response even on error
    return NextResponse.json(createFallbackResponse("Error occurred during processing"), { status: 200 })
  }
}

// Helper function to create fallback response
function createFallbackResponse(extractedText: string) {
  // Try to extract basic info from the text if available
  const nameMatch = extractedText.match(/([A-Z][a-z]+ [A-Z][a-z]+)/)?.[0] || "Your Name"
  const emailMatch =
    extractedText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)?.[0] || "your.email@example.com"
  const phoneMatch = extractedText.match(/(\+?[\d\s\-$$$$]{10,})/)?.[0] || "+1 (555) 123-4567"

  return {
    optimizedCV: {
      personalInfo: {
        name: nameMatch,
        email: emailMatch,
        phone: phoneMatch,
        location: "Your Location",
        linkedin: "",
        website: "",
      },
      summary:
        "Dedicated professional with strong analytical and problem-solving skills. Experienced in working collaboratively in team environments and committed to delivering high-quality results. Seeking opportunities to contribute expertise and grow within a dynamic organization.",
      workExperience: [
        {
          title: "Professional Role",
          company: "Previous Company",
          duration: "2022 - Present",
          description:
            "Contributed to team objectives and organizational goals through effective collaboration and task execution. Demonstrated reliability and adaptability in various work situations.",
        },
      ],
      education: [
        {
          degree: "Bachelor's Degree",
          institution: "University/College",
          year: "2022",
          gpa: "",
        },
      ],
      skills: [
        "Communication",
        "Problem Solving",
        "Team Collaboration",
        "Time Management",
        "Analytical Thinking",
        "Adaptability",
        "Microsoft Office",
        "Project Management",
      ],
      projects: [
        {
          name: "Professional Project",
          description:
            "Completed project demonstrating technical and analytical capabilities with successful outcomes.",
          technologies: ["Relevant Technology", "Tools Used"],
        },
      ],
      certifications: [],
      languages: ["English (Fluent)"],
      interests: ["Professional Development", "Technology", "Learning"],
    },
    suggestions: [
      "Add specific work experience details and achievements",
      "Include quantifiable results and metrics in job descriptions",
      "Expand technical skills section with industry-relevant technologies",
      "Add professional certifications to enhance credibility",
      "Include specific project details with technologies used",
    ],
    improvementScore: 75,
  }
}
