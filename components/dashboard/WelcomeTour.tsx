"use client"

import { useEffect } from 'react'
import { renderToString } from 'react-dom/server'
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { useAppSelector } from '../../lib/redux/hooks'
import { useTheme } from 'next-themes'
import { Sparkles, UserCircle, FileText, Mail, Target, Settings } from 'lucide-react'

export function WelcomeTour() {
  const { user } = useAppSelector((state) => state.auth)
  const { theme } = useTheme()

  useEffect(() => {
    // Check if user is logged in, is a regular user, and hasn't seen the tour
    if (user && user.role === 'user') {
      const hasSeenTour = localStorage.getItem(`welcome_tour_seen_${user.id}`)

      if (!hasSeenTour) {
        // Add custom styles for your theme
        const style = document.createElement('style')
        style.innerHTML = `
          .custom-driver-popover {
            font-family: 'Inter', -apple-system, sans-serif;
            border-radius: 12px !important;
            box-shadow: 0 10px 40px rgba(45, 54, 57, 0.15) !important;
            border: 1px solid #e5e7eb !important;
            overflow: hidden !important;
          }
          
          .custom-driver-popover.driverjs-theme {
            background-color: white !important;
            color: #2d3639 !important;
          }
          
          .dark .custom-driver-popover.driverjs-theme {
            background-color: #1f2937 !important;
            color: #f9fafb !important;
            border-color: #374151 !important;
          }
          
          .custom-driver-popover .driver-popover-title {
            font-weight: 600 !important;
            font-size: 1.125rem !important;
            color: #2d3639 !important;
            margin-bottom: 0.5rem !important;
          }
          
          .dark .custom-driver-popover .driver-popover-title {
            color: #f9fafb !important;
          }
          
          .custom-driver-popover .driver-popover-description {
            font-size: 0.875rem !important;
            line-height: 1.5 !important;
          }
          
          .custom-driver-popover .driver-popover-footer {
            padding-top: 1rem !important;
            margin-top: 1rem !important;
            border-top: 1px solid #e5e7eb !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          
          .dark .custom-driver-popover .driver-popover-footer {
            border-top-color: #374151 !important;
          }
          
          .custom-driver-popover .driver-popover-progress-text {
            font-size: 0.75rem !important;
            color: #6b7280 !important;
            font-weight: 500 !important;
          }
          
          .custom-driver-popover .driver-btn {
            border-radius: 8px !important;
            font-weight: 500 !important;
            font-size: 0.875rem !important;
            padding: 0.5rem 1rem !important;
            transition: all 0.2s !important;
            cursor: pointer !important;
          }
          
          .custom-driver-popover .driver-btn.driver-next-btn {
            background: linear-gradient(135deg, #70E4A8 0%, #4ACD8C 100%) !important;
            color: white !important;
            border: none !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
          }
          
          .custom-driver-popover .driver-btn.driver-next-btn:hover {
            opacity: 0.9 !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(74, 205, 140, 0.3) !important;
          }
          
          .custom-driver-popover .driver-btn.driver-prev-btn {
            background-color: transparent !important;
            color: #6b7280 !important;
            border: 1px solid #d1d5db !important;
          }
          
          .dark .custom-driver-popover .driver-btn.driver-prev-btn {
            color: #d1d5db !important;
            border-color: #4b5563 !important;
          }
          
          .custom-driver-popover .driver-btn.driver-prev-btn:hover {
            background-color: #f9fafb !important;
            color: #1f2937 !important;
          }
          
          .dark .custom-driver-popover .driver-btn.driver-prev-btn:hover {
            background-color: #374151 !important;
            color: #f9fafb !important;
          }
          
          .custom-driver-popover .driver-btn.driver-close-btn {
             display: none !important; /* Hide standard close button in favor of clicking overlay or finish */
          }
          
          .custom-driver-popover .driver-popover-arrow {
            display: none !important;
          }
          
          /* Custom highlight ring */
          .driver-highlighted-element {
            box-shadow: 0 0 0 4px rgba(112, 228, 168, 0.3), 0 0 30px rgba(112, 228, 168, 0.1) !important;
            border-radius: 8px !important;
            z-index: 100001 !important;
          }
        `
        document.head.appendChild(style)

        // Initialize driver.js with your theme
        const driverObj = driver({
          showProgress: true,
          allowClose: true,
          animate: true,
          smoothScroll: true,
          overlayColor: theme === 'dark' ? 'rgba(29, 41, 57, 0.85)' : 'rgba(45, 54, 57, 0.85)',
          showButtons: ['next', 'previous', 'close'],
          nextBtnText: 'Next →',
          prevBtnText: '← Back',
          doneBtnText: 'Get Started!',
          progressText: 'Step {{current}} of {{total}}',
          popoverClass: 'custom-driver-popover',

          onDestroyed: () => {
            // Remove custom styles
            if (document.head.contains(style)) {
              document.head.removeChild(style)
            }

            // Mark tour as seen when finished or skipped
            if (user?.id) {
              localStorage.setItem(`welcome_tour_seen_${user.id}`, 'true')
            }
          },

          steps: [
            {
              element: '#tour-create-persona',
              popover: {
                title: renderToString(
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #70E4A8 0%, #4ACD8C 100%)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>
                    </div>
                    <span>Create Your Persona</span>
                  </div>
                ),
                description: renderToString(
                  <div className="space-y-2">
                    <p className="text-sm">
                      This is where your journey begins! Create your professional persona once and use it to generate all your resumes and cover letters.
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded" style={{ marginTop: '8px' }}>
                      <span className="font-semibold" style={{ color: '#70E4A8' }}>Tip:</span> Your persona includes your profile picture, work experience, education, and skills.
                    </div>
                  </div>
                ),
                side: "bottom",
                align: 'center'
              }
            },
            {
              element: '#tour-resumes',
              popover: {
                title: renderToString(
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #70E4A8 0%, #4ACD8C 100%)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="M8 15h8" /></svg>
                    </div>
                    <span>AI-Powered Resumes</span>
                  </div>
                ),
                description: renderToString(
                  <div className="space-y-2">
                    <p className="text-sm">
                      Generate professional resumes tailored to specific job descriptions. Choose from multiple templates and let AI optimize your content.
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded" style={{ marginTop: '8px' }}>
                      <span className="font-semibold" style={{ color: '#70E4A8' }}>Pro Tip:</span> Free plan allows 3 resumes. Upgrade to Pro for unlimited creations.
                    </div>
                  </div>
                ),
                side: "bottom",
                align: 'center'
              }
            },
            {
              element: '#tour-cover-letter',
              popover: {
                title: renderToString(
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </div>
                    <span>Personalized Cover Letters</span>
                  </div>
                ),
                description: renderToString(
                  <div className="space-y-2">
                    <p className="text-sm">
                      Create compelling cover letters that match your resume. Choose from different tones (Professional, Enthusiastic, Confident, etc.).
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded" style={{ marginTop: '8px' }}>
                      <span className="font-semibold" style={{ color: '#EA580C' }}>Tip:</span> Paste the job description to get the most tailored cover letter.
                    </div>
                  </div>
                ),
                side: "bottom",
                align: 'center'
              }
            },
            {
              element: '#tour-ats-checker',
              popover: {
                title: renderToString(
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #70E4A8 0%, #4ACD8C 100%)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                    </div>
                    <span>ATS Compatibility Checker</span>
                  </div>
                ),
                description: renderToString(
                  <div className="space-y-2">
                    <p className="text-sm">
                      Analyze your resume against Applicant Tracking Systems used by 95% of employers. Get scores and suggestions to improve.
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded" style={{ marginTop: '8px' }}>
                      <span className="font-semibold" style={{ color: '#70E4A8' }}>Goal:</span> Aim for 85%+ ATS score for best results.
                    </div>
                  </div>
                ),
                side: "bottom",
                align: 'center'
              }
            },
            {
              element: '#tour-profile',
              popover: {
                title: renderToString(
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                    </div>
                    <span>Profile & Settings</span>
                  </div>
                ),
                description: renderToString(
                  <div className="space-y-2">
                    <p className="text-sm">
                      Manage your account, update personal information, change password, and upgrade your plan to unlock all features.
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded" style={{ marginTop: '8px' }}>
                      <span className="font-semibold" style={{ color: '#EA580C' }}>Dashboard:</span> Track your resume, cover letter, and persona counts here.
                    </div>
                  </div>
                ),
                side: "bottom",
                align: 'center'
              }
            }
          ]
        })

        // Add a small delay to ensure UI is fully rendered
        const timer = setTimeout(() => {
          driverObj.drive()
        }, 1500)

        return () => {
          clearTimeout(timer)
          // Note: we don't destroy driver here to allow it to finish animation if component unmounts quickly,
          // but strictly speaking we should if it's running. 
          // However, the onDestroyed callback handles style cleanup.
        }
      }
    }
  }, [user, theme])

  return null
}
