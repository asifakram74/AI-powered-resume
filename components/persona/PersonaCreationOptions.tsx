"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, Linkedin, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import type { CVData } from "@/types/cv-data"

interface PersonaCreationOptionsProps {
  onOptionSelect: (option: "manual" | "pdf" | "linkedin", data?: Partial<Omit<CVData, "id" | "createdAt">>) => void
}

export function PersonaCreationOptions({ onOptionSelect }: PersonaCreationOptionsProps) {
  const [isConnectingLinkedIn, setIsConnectingLinkedIn] = useState(false)
  const [linkedInConnected, setLinkedInConnected] = useState(false)

  const handleLinkedInConnect = async () => {
    setIsConnectingLinkedIn(true)

    // Simulate LinkedIn connection
    setTimeout(() => {
      setLinkedInConnected(true)
      setIsConnectingLinkedIn(false)

      const linkedInData = {
        personalInfo: {
          fullName: "Jane Smith",
          jobTitle: "Product Manager",
          email: "jane.smith@example.com",
          phone: "+1 (555) 987-6543",
          address: "456 Oak Ave",
          city: "New York",
          country: "United States",
          profilePicture: "",
          summary: "Strategic product manager with 6+ years of experience in SaaS products...",
          linkedin: "https://linkedin.com/in/janesmith",
          github: "",
        },
        experience: [
          {
            id: "1",
            jobTitle: "Senior Product Manager",
            companyName: "SaaS Company",
            location: "New York, NY",
            startDate: "2021-03-01",
            endDate: "",
            current: true,
            responsibilities: [
              "Define product roadmap and strategy",
              "Collaborate with engineering and design teams",
              "Analyze user feedback and market trends",
            ],
          },
        ],
        skills: {
          technical: ["Product Strategy", "Data Analysis", "A/B Testing", "SQL"],
          soft: ["Strategic Thinking", "Cross-functional Leadership", "User Empathy"],
        },
        education: [
          {
            id: "1",
            degree: "MBA",
            institutionName: "Harvard Business School",
            location: "Boston, MA",
            graduationDate: "2018-05-01",
            gpa: "3.9",
            honors: "Baker Scholar",
            additionalInfo: "",
          },
        ],
        languages: [
          { id: "1", name: "English", proficiency: "Native" as const },
          { id: "2", name: "Spanish", proficiency: "Fluent" as const },
        ],
        certifications: [
          {
            id: "1",
            title: "Certified Scrum Product Owner",
            issuingOrganization: "Scrum Alliance",
            dateObtained: "2020-08-15",
            verificationLink: "https://verify.scrumalliance.org",
          },
        ],
        projects: [],
        additional: {
          interests: ["Product Design", "Startups", "Travel"],
        },
      }

      onOptionSelect("linkedin", linkedInData)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Your Preferred Method</h3>
        <p className="text-sm text-gray-600">
          Select how you'd like to create your persona. All methods will show the complete form for final review.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Manual Entry Option */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Fill Out Form</CardTitle>
            <CardDescription>Manually enter your information using our comprehensive form</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => onOptionSelect("manual")}>
              Start Manual Entry
            </Button>
            <div className="mt-3 text-xs text-gray-500 text-center">Most comprehensive control over your data</div>
          </CardContent>
        </Card>

        {/* PDF Upload Option */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Upload PDF Resume</CardTitle>
            <CardDescription>Extract information automatically from your existing resume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => onOptionSelect("pdf")}>
              Upload PDF
            </Button>
            <div className="mt-3 text-xs text-gray-500 text-center">AI will extract and organize your information</div>
          </CardContent>
        </Card>

        {/* LinkedIn Import Option */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Linkedin className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Import from LinkedIn</CardTitle>
            <CardDescription>Connect your LinkedIn profile to import professional data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {linkedInConnected ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                LinkedIn Connected Successfully
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertCircle className="h-4 w-4" />
                Not connected to LinkedIn
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleLinkedInConnect}
              disabled={isConnectingLinkedIn || linkedInConnected}
              variant={linkedInConnected ? "secondary" : "default"}
            >
              {isConnectingLinkedIn ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : linkedInConnected ? (
                "Import LinkedIn Data"
              ) : (
                "Connect LinkedIn"
              )}
            </Button>

            <div className="mt-3 text-xs text-gray-500 text-center">Secure OAuth connection to LinkedIn</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-1">
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">What happens next?</h4>
            <p className="text-sm text-blue-700">
              Regardless of the method you choose, you'll see the complete persona form with any extracted data
              pre-filled. You can then review, edit, and complete any missing information before generating your final
              AI persona.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
