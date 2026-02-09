"use client"

import { useEffect } from 'react'
import { useAppDispatch } from "../../lib/redux/hooks"
import { renderToString } from 'react-dom/server'
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { useAppSelector } from '../../lib/redux/hooks'
import { useTheme } from 'next-themes'
import { updateProfile } from "../../lib/redux/slices/authSlice"

export function WelcomeTour() {
  const { user, profile } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { theme } = useTheme()

  const updateFirstLogin = () => {
    dispatch(
      updateProfile({
        first_login: '0',
      })
    )
  }

  useEffect(() => {
    if (!profile || !user?.id) return

    const isFirstLogin =
      profile.first_login === true ||
      profile.first_login === '1' ||
      profile.first_login === 1

    const isActive = profile.status === 'Active'
    const role = profile.role === 'User'

    const tourSeen = localStorage.getItem(`welcome_tour_seen_${user.id}`)
    if (tourSeen === 'true') return

    if (isFirstLogin && isActive && role) {
      const driverObj = driver({
        showProgress: true,
        allowClose: true,
        animate: true,
        smoothScroll: true,
        overlayColor:
          theme === 'dark'
            ? 'rgba(29, 41, 57, 0.85)'
            : 'rgba(45, 54, 57, 0.85)',
        showButtons: ['next', 'previous', 'close'],
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        doneBtnText: 'Finish',
        progressText: 'Step {{current}} of {{total}}',
        popoverClass: 'resumaic-driver-popover',

        onDestroyed: () => {
          document.body.classList.remove('tour-active')
          updateFirstLogin()
        },

        steps: [
          {
            element: '#tour-persona',
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
                </div>
              ),
              side: "right",
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
                </div>
              ),
              side: "right",
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
                </div>
              ),
              side: "right",
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
                </div>
              ),
              side: "right",
              align: 'center'
            }
          },
          {
            element: '#tour-profile-card',
            popover: {
              title: renderToString(
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 10h2" /><path d="M16 14h2" /><path d="M6.17 15a3 3 0 0 1 5.66 0" /><circle cx="9" cy="11" r="2" /><rect x="2" y="5" width="20" height="14" rx="2" /></svg>
                  </div>
                  <span>Digital Profile Card</span>
                </div>
              ),
              description: renderToString(
                <div className="space-y-2">
                  <p className="text-sm">
                    Create a stunning digital business card. Share your professional identity with a simple link or QR code.
                  </p>
                </div>
              ),
              side: "right",
              align: 'center'
            }
          },
          {
            element: '#tour-analytics',
            popover: {
              title: renderToString(
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
                  </div>
                  <span>Performance Analytics</span>
                </div>
              ),
              description: renderToString(
                <div className="space-y-2">
                  <p className="text-sm">
                    Track how your resumes and profile are performing. See views, downloads, and engagement metrics in real-time.
                  </p>
                </div>
              ),
              side: "right",
              align: 'center'
            }
          },
          {
            element: '#tour-job-application-system',
            popover: {
              title: renderToString(
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                  </div>
                  <span>Job Application System</span>
                </div>
              ),
              description: renderToString(
                <div className="space-y-2">
                  <p className="text-sm">
                    Your central hub for finding and tracking job opportunities. Manage your entire job search process in one place.
                  </p>
                </div>
              ),
              side: "right",
              align: 'center'
            }
          },
          {
            element: '#tour-job-search',
            popover: {
              title: renderToString(
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  </div>
                  <span>Search Jobs</span>
                </div>
              ),
              description: renderToString(
                <div className="space-y-2">
                  <p className="text-sm">
                    Search millions of jobs from top boards. Filter by role, location, and salary to find your perfect match.
                  </p>
                  <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded" style={{ marginTop: '8px' }}>
                    <span className="font-semibold" style={{ color: '#10B981' }}>Feature:</span> Save jobs directly to your tracker with one click.
                  </div>
                </div>
              ),
              side: "right",
              align: 'center'
            }
          },
          {
            element: '#tour-applications',
            popover: {
              title: renderToString(
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 5v11" /><path d="M12 5v6" /><path d="M18 5v14" /><rect width="20" height="18" x="2" y="3" rx="2" /></svg>
                  </div>
                  <span>Application Tracker</span>
                </div>
              ),
              description: renderToString(
                <div className="space-y-2">
                  <p className="text-sm">
                    Keep track of every application. Move jobs through stages (Applied, Interview, Offer) using our drag-and-drop board.
                  </p>
                  <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded" style={{ marginTop: '8px' }}>
                    <span className="font-semibold" style={{ color: '#3B82F6' }}>Pro Tip:</span> Never lose track of a follow-up date again.
                  </div>
                </div>
              ),
              side: "right",
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
              side: "right",
              align: 'center'
            }
          }
        ]
      })

      const timer = setTimeout(() => {
        document.body.classList.add('tour-active')
        driverObj.drive()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [user, profile, theme])

  return null
}
