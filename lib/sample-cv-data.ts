import type { CVData } from "../types/cv-data"

export const sampleCVData: CVData = {
  id: "sample",
  personalInfo: {
    fullName: "John Doe",
    jobTitle: "Senior Software Engineer",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street",
    city: "San Francisco",
    country: "USA",
    profilePicture: "/placeholder.jpg",
    summary: "Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Passionate about creating scalable solutions and leading technical teams to deliver high-quality products.",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe"
  },
  experience: [
    {
      id: "exp1",
      jobTitle: "Senior Software Engineer",
      companyName: "TechCorp Inc.",
      location: "San Francisco, CA",
      startDate: "2022-01",
      endDate: "",
      current: true,
      responsibilities: [
        "Led development of microservices architecture serving 1M+ users",
        "Mentored 5 junior developers and conducted code reviews",
        "Implemented CI/CD pipelines reducing deployment time by 60%",
        "Optimized database queries improving performance by 40%"
      ]
    },
    {
      id: "exp2",
      jobTitle: "Software Engineer",
      companyName: "StartupXYZ",
      location: "San Francisco, CA",
      startDate: "2020-03",
      endDate: "2021-12",
      current: false,
      responsibilities: [
        "Developed React-based frontend applications",
        "Built RESTful APIs using Node.js and Express",
        "Collaborated with design team to implement UI/UX improvements",
        "Participated in agile development processes"
      ]
    }
  ],
  education: [
    {
      id: "edu1",
      degree: "Bachelor of Science in Computer Science",
      institutionName: "University of California, Berkeley",
      location: "Berkeley, CA",
      graduationDate: "2020-05",
      gpa: "3.8",
      honors: "Magna Cum Laude",
      additionalInfo: "Relevant coursework: Data Structures, Algorithms, Software Engineering"
    }
  ],
  skills: {
    technical: [
      "JavaScript/TypeScript",
      "React/Next.js",
      "Node.js/Express",
      "Python",
      "PostgreSQL",
      "MongoDB",
      "AWS",
      "Docker",
      "Git"
    ],
    soft: [
      "Team Leadership",
      "Problem Solving",
      "Communication",
      "Agile/Scrum",
      "Mentoring"
    ]
  },
  languages: [
    {
      id: "lang1",
      name: "English",
      proficiency: "Native"
    },
    {
      id: "lang2",
      name: "Spanish",
      proficiency: "Intermediate"
    }
  ],
  certifications: [
    {
      id: "cert1",
      title: "AWS Certified Solutions Architect",
      issuingOrganization: "Amazon Web Services",
      dateObtained: "2023-06",
      verificationLink: "aws.amazon.com/verification"
    }
  ],
  projects: [
    {
      id: "proj1",
      name: "E-commerce Platform",
      role: "Full-stack Developer",
      description: "Built a scalable e-commerce platform using React, Node.js, and PostgreSQL",
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe API"],
      liveDemoLink: "demo.ecommerce.com",
      githubLink: "github.com/johndoe/ecommerce"
    }
  ],
  additional: {
    interests: ["Open Source", "Machine Learning", "Hiking", "Photography"]
  },
  createdAt: "2024-01-01"
} 