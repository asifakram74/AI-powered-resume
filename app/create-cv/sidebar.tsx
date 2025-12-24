// "use client"

// import { useEffect, useState } from "react"
// import { Download, PlusCircle, Layout, Palette, Layers, Crown, LogOut, Home, FileText, FileOutput, FileInput } from "lucide-react"
// import Link from "next/link"
// import Image from "next/image"
// import {
//   Sidebar as SidebarPrimitive,
//   SidebarContent,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarFooter,
// } from "../../components/ui/sidebar"
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../../components/ui/dropdown-menu"
// import { Button } from "../../components/ui/button"
// import { useAppDispatch, useAppSelector } from "../../lib/redux/hooks"
// import { logoutUser } from "../../lib/redux/slices/authSlice"
// import { useRouter } from "next/navigation"

// interface SidebarProps {
//   user: any
//   activePage: string
//   setActivePage: (page: string) => void
//   onExportPDF: () => void
//   onExportDOCX: () => void
//   onExportPNG: () => void
//   exportMode?: boolean
// }

// export function Sidebar({ 
//   user,
//   activePage, 
//   setActivePage,
//   onExportPDF,
//   onExportDOCX,
//   onExportPNG,
//   exportMode = false
// }: SidebarProps) {
//   const [isMounted, setIsMounted] = useState(false)
//   const dispatch = useAppDispatch()
//   const router = useRouter()

//   useEffect(() => {
//     setIsMounted(true)
//   }, [])

//   const handleLogout = async () => {
//     await dispatch(logoutUser())
//     router.push("/")
//   }

//   return (
//     <SidebarPrimitive
//       className={`border-r border-gray-200/60 bg-white ${!isMounted ? "invisible" : ""}`}
//       aria-hidden={!isMounted}
//     >
//       <SidebarHeader className="p-6 pb-4">
//         <div className="flex items-center gap-3">
//           <Link href="/">
//             <Image 
//               src="/Resumic.png" 
//               alt="Logo" 
//               width={200} 
//               height={90}  
//               className="cursor-pointer hover:opacity-80 transition-opacity"
//             />
//           </Link>
//         </div>
//         {user && (
//           <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//             <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
//             <p className="text-xs text-gray-500 break-all">{user.email}</p>
//             {user.plan && (
//               <div className="mt-1 flex items-center gap-1">
//                 <Crown className="h-3 w-3 text-yellow-500" />
//                 <span className="text-xs text-gray-500">{user.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}</span>
//               </div>
//             )}
//           </div>
//         )}
//       </SidebarHeader>

//       <SidebarContent className="px-3">
//         <SidebarMenu className="space-y-1">
//           {/* Export Resume with dropdown - only show in export mode */}
//           {exportMode && (
//             <SidebarMenuItem>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <SidebarMenuButton
//                     isActive={activePage === "export-resume"}
//                     className="w-full justify-start gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-sm data-[active=true]:border data-[active=true]:border-blue-100 group"
//                   >
//                     <div className="flex items-center gap-3 flex-1">
//                       <Download className="h-5 w-5 text-gray-600 group-data-[active=true]:text-blue-600" />
//                       <span className="font-medium text-gray-700 group-data-[active=true]:text-blue-700">
//                         Export Resume
//                       </span>
//                     </div>
//                   </SidebarMenuButton>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-56">
//                   <DropdownMenuItem 
//                     className="gap-2 cursor-pointer" 
//                     onClick={onExportPDF}
//                   >
//                     <FileText className="h-4 w-4" /> PDF
//                   </DropdownMenuItem>
//                   <DropdownMenuItem 
//                     className="gap-2 cursor-pointer" 
//                     onClick={onExportDOCX}
//                   >
//                     <FileOutput className="h-4 w-4" /> DOCX
//                   </DropdownMenuItem>
//                   <DropdownMenuItem 
//                     className="gap-2 cursor-pointer" 
//                     onClick={onExportPNG}
//                   >
//                     <FileInput className="h-4 w-4" /> PNG
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </SidebarMenuItem>
//           )}

//           {/* Dashboard Navigation Items - only show when not in export mode */}
//           {!exportMode && (
//             <>
//               <SidebarMenuItem>
//                 <SidebarMenuButton
//                   onClick={() => setActivePage("create-persona")}
//                   isActive={activePage === "create-persona"}
//                   className="w-full justify-start gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-sm data-[active=true]:border data-[active=true]:border-blue-100 group"
//                 >
//                   <div className="flex items-center gap-3 flex-1">
//                     <PlusCircle className="h-5 w-5 text-gray-600 group-data-[active=true]:text-blue-600" />
//                     <span className="font-medium text-gray-700 group-data-[active=true]:text-blue-700">Create Persona</span>
//                   </div>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>

//               <SidebarMenuItem>
//                 <SidebarMenuButton
//                   onClick={() => setActivePage("resumes")}
//                   isActive={activePage === "resumes"}
//                   className="w-full justify-start gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-sm data-[active=true]:border data-[active=true]:border-blue-100 group"
//                 >
//                   <div className="flex items-center gap-3 flex-1">
//                     <Layout className="h-5 w-5 text-gray-600 group-data-[active=true]:text-blue-600" />
//                     <span className="font-medium text-gray-700 group-data-[active=true]:text-blue-700">My Resumes</span>
//                   </div>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>

//               <SidebarMenuItem>
//                 <SidebarMenuButton
//                   onClick={() => setActivePage("cover-letter")}
//                   isActive={activePage === "cover-letter"}
//                   className="w-full justify-start gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-sm data-[active=true]:border data-[active=true]:border-blue-100 group"
//                 >
//                   <div className="flex items-center gap-3 flex-1">
//                     <FileText className="h-5 w-5 text-gray-600 group-data-[active=true]:text-blue-600" />
//                     <span className="font-medium text-gray-700 group-data-[active=true]:text-blue-700">Cover Letters</span>
//                   </div>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>

//               <SidebarMenuItem>
//                 <SidebarMenuButton
//                   onClick={() => setActivePage("ats-checker")}
//                   isActive={activePage === "ats-checker"}
//                   className="w-full justify-start gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-sm data-[active=true]:border data-[active=true]:border-blue-100 group"
//                 >
//                   <div className="flex items-center gap-3 flex-1">
//                     <Palette className="h-5 w-5 text-gray-600 group-data-[active=true]:text-blue-600" />
//                     <span className="font-medium text-gray-700 group-data-[active=true]:text-blue-700">ATS Checker</span>
//                   </div>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>

//               <SidebarMenuItem>
//                 <SidebarMenuButton
//                   onClick={() => setActivePage("profile")}
//                   isActive={activePage === "profile"}
//                   className="w-full justify-start gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-sm data-[active=true]:border data-[active=true]:border-blue-100 group"
//                 >
//                   <div className="flex items-center gap-3 flex-1">
//                     <Layers className="h-5 w-5 text-gray-600 group-data-[active=true]:text-blue-600" />
//                     <span className="font-medium text-gray-700 group-data-[active=true]:text-blue-700">Profile</span>
//                   </div>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </>
//           )}
//         </SidebarMenu>
//       </SidebarContent>

//       <SidebarFooter className="p-4 mt-auto">
//         <Button variant="outline" className="w-full bg-transparent mb-2" onClick={handleLogout}>
//           <LogOut className="h-4 w-4 mr-2" />
//           Logout
//         </Button>
//         {exportMode ? (
//           <Link href="/dashboard">
//             <Button variant="secondary" className="w-full">
//               <Home className="h-4 w-4 mr-2" />
//               Back to Dashboard
//             </Button>
//           </Link>
//         ) : (
//           <Link href="/">
//             <Button variant="secondary" className="w-full">
//               <Home className="h-4 w-4 mr-2" />
//               Back to Home
//             </Button>
//           </Link>
//         )}
//       </SidebarFooter>
//     </SidebarPrimitive>
//   )
// }