"use client"
import { Sparkles, Zap, FileText } from "lucide-react"

interface PublicPageLoadingProps {
  type: "resume" | "cover-letter" | "profile-card"
}

export function PublicPageLoading({ type }: PublicPageLoadingProps) {
  let title = "Loading..."
  let subtitle = "Please wait..."
  
  if (type === "resume") {
    title = "Loading Resume"
    subtitle = "Fetching professional details..."
  } else if (type === "cover-letter") {
    title = "Loading Cover Letter"
    subtitle = "Fetching cover letter content..."
  } else if (type === "profile-card") {
    title = "Loading Profile Card"
    subtitle = "Fetching profile details..."
  }
  
  return (
    <div className="min-h-screen resumaic-gradient-subtle flex items-center justify-center relative overflow-hidden bg-white dark:bg-gray-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 resumaic-gradient-green rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 resumaic-gradient-orange rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl animate-pulse"></div>
      </div>

      <div className="text-center max-w-md mx-auto px-6 relative z-10">
        {/* Animated Icon */}
        <div className="relative mb-8 animate-fade-in">
          <div className="w-24 h-24 mx-auto relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 resumaic-gradient-green rounded-full animate-spin-slow opacity-80"></div>
            <div className="absolute inset-1 bg-white dark:bg-gray-950 rounded-full shadow-2xl flex items-center justify-center animate-pulse-gentle">
              <FileText className="w-10 h-10 text-emerald-600 animate-bounce-gentle" />
            </div>
            {/* Inner glow */}
            <div className="absolute inset-3 resumaic-gradient-green rounded-full opacity-20 animate-ping"></div>
          </div>

          {/* Floating particles */}
          <div className="absolute -top-3 -left-3 w-4 h-4 resumaic-gradient-green rounded-full animate-float opacity-80"></div>
          <div className="absolute -top-2 -right-4 w-3 h-3 resumaic-gradient-orange rounded-full animate-float-delayed opacity-70"></div>
          <div className="absolute -bottom-3 -left-2 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-float animation-delay-700 opacity-60"></div>
          <div className="absolute -bottom-1 -right-2 w-2 h-2 resumaic-gradient-green rounded-full animate-ping animation-delay-1000"></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-6 animate-fade-in-up animation-delay-300">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-3 animate-pulse-gentle">
            <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
            <span className="resumaic-text-gradient bg-clip-text text-transparent">{title}</span>
            <Zap className="w-6 h-6 text-emerald-500 animate-bounce-gentle" />
          </h2>

          <div className="bg-white/90 dark:bg-gray-950/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-emerald-100/50 dark:border-emerald-900/30 animate-slide-up animation-delay-500">
            <p className="text-xl font-semibold text-emerald-700 mb-3 animate-fade-in animation-delay-700">
              {subtitle}
            </p>
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed animate-fade-in animation-delay-900">
              Please wait while we retrieve the document...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200/80 dark:bg-gray-800/70 rounded-full h-3 overflow-hidden shadow-inner animate-fade-in animation-delay-1100">
            <div className="h-full resumaic-gradient-green rounded-full animate-progress-flow shadow-lg"></div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 animate-fade-in animation-delay-1500">
            Powered by Resumaic AI
          </p>
        </div>
      </div>
    </div>
  )
}
