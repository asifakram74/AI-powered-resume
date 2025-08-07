// "use client"

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Crown, Check } from "lucide-react"
// import { useState } from "react"
// import ResumeTemplate from "./ResumeTemplate"
// import { sampleCVData } from "@/lib/sample-cv-data"

// interface CVTemplate {
//   id: string
//   name: string
//   description: string
//   category: "modern" | "classic" | "creative" | "minimal"
//   isPremium: boolean
// }

// const templates: CVTemplate[] = [
//   {
//     id: "modern",
//     name: "Modern Professional",
//     description: "Clean, modern design perfect for tech and business professionals",
//     category: "modern",
//     isPremium: false,
//   },
//   {
//     id: "classic",
//     name: "Classic Traditional",
//     description: "Traditional format ideal for conservative industries",
//     category: "classic",
//     isPremium: false,
//   },
//   {
//     id: "creative",
//     name: "Creative Designer",
//     description: "Eye-catching design for creative professionals",
//     category: "creative",
//     isPremium: true,
//   },
//   {
//     id: "minimal",
//     name: "Minimal Clean",
//     description: "Simple, clean layout focusing on content",
//     category: "minimal",
//     isPremium: false,
//   },
// ]

// interface CVTemplatesProps {
//   onTemplateSelect: (template: CVTemplate) => void
//   selectedTemplate?: string
//   userPlan?: string
// }

// export function CVTemplates({ onTemplateSelect, selectedTemplate, userPlan = "free" }: CVTemplatesProps) {
//   const [filter, setFilter] = useState<"all" | "modern" | "classic" | "creative" | "minimal">("all")

//   const filteredTemplates = templates.filter((template) => {
//     if (filter === "all") return true
//     return template.category === filter
//   })

//   const canUseTemplate = (template: CVTemplate) => {
//     return !template.isPremium || userPlan === "premium" || userPlan === "pro"
//   }

//   return (
//     <div className="space-y-6">
//       <div className="text-center">
//         <h3 className="text-lg font-semibold mb-2">Choose Your CV Template</h3>
//         <p className="text-sm text-gray-600">Select a professional template that matches your industry and style</p>
//       </div>

//       {/* Filter Buttons */}
//       <div className="flex flex-wrap justify-center gap-2">
//         {["all", "modern", "classic", "creative", "minimal"].map((category) => (
//           <Button
//             key={category}
//             variant={filter === category ? "default" : "outline"}
//             size="sm"
//             onClick={() => setFilter(category as any)}
//             className="capitalize"
//           >
//             {category}
//           </Button>
//         ))}
//       </div>

//       {/* Templates Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredTemplates.map((template) => {
//           const isSelected = selectedTemplate === template.id
//           const canUse = canUseTemplate(template)

//           return (
//             <Card
//               key={template.id}
//               className={`cursor-pointer h-full w-full  transition-all duration-200 hover:shadow-lg ${
//                 isSelected ? "ring-2 ring-blue-900 border-blue-900" : ""
//               } ${!canUse ? "opacity-60" : ""}`}
//               onClick={() => canUse && onTemplateSelect(template)}
//             >
//               <CardHeader className="p-4">
//                 <div className="relative">
//                   <div className="w-full  overflow-hidden rounded-lg ">
//                     <div className=" flex items-center justify-center">
//                       <div className=" h-32">
//                         <ResumeTemplate
//                         className="w-12 h-32"
//                         scale={0.2}
//                           data={sampleCVData}
//                           templateId={template.id}
//                           isPreview={true}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                   {template.isPremium && (
//                     <Badge className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
//                       <Crown className="h-3 w-3 mr-1" />
//                       Premium
//                     </Badge>
//                   )}
//                   {isSelected && (
//                     <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
//                       <div className="bg-blue-500 rounded-full p-2">
//                         <Check className="h-4 w-4 text-white" />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </CardHeader>
//               <CardContent className="p-4 pt-0">
//                 <CardTitle className="text-base mb-1">{template.name}</CardTitle>
//                 <CardDescription className="text-sm mb-3">{template.description}</CardDescription>
//                 <div className="flex items-center justify-between">
//                   <Badge variant="secondary" className="capitalize">
//                     {template.category}
//                   </Badge>
//                   {!canUse && (
//                     <Badge variant="outline" className="text-orange-600 border-orange-200">
//                       Upgrade Required
//                     </Badge>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           )
//         })}
//       </div>

//       {userPlan === "free" && (
//         <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
//           <div className="flex items-start gap-3">
//             <div className="rounded-full bg-orange-100 p-1">
//               <Crown className="h-4 w-4 text-orange-600" />
//             </div>
//             <div>
//               <h4 className="font-medium text-orange-900 mb-1">Unlock Premium Templates</h4>
//               <p className="text-sm text-orange-700 mb-3">
//                 Upgrade to access our premium collection of professional CV templates designed by experts.
//               </p>
//               <Button
//                 size="sm"
//                 className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
//               >
//                 Upgrade Plan
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
