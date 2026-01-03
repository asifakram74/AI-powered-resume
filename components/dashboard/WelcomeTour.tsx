"use client"

import { useEffect, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { useAppSelector, useAppDispatch } from '../../lib/redux/hooks'
import { useTheme } from 'next-themes'
import { updateProfile } from "../../lib/redux/slices/authSlice"

export function WelcomeTour() {
  const { user, profile } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { theme } = useTheme()
  const [hasRunTour, setHasRunTour] = useState(false)

  // Check localStorage to see if tour has run before
  useEffect(() => {
    const tourCompleted = localStorage.getItem('welcomeTourCompleted')
    if (tourCompleted === 'true') {
      setHasRunTour(true)
    }
  }, [])

  // Function to mark tour as completed
  const markTourAsCompleted = () => {
    localStorage.setItem('welcomeTourCompleted', 'true')
    setHasRunTour(true)
    
    // Also update the backend if user is logged in
    if (user?.id) {
      try {
        dispatch(updateProfile({
          first_login: 0 
        })).unwrap()
        console.log('First login status updated to 1 (tour completed)')
      } catch (error) {
        console.error('Error updating first login status:', error)
      }
    }
  }

  useEffect(() => {
    // Debug logging to check values
    console.log('WelcomeTour Debug:', {
      userId: user?.id,
      userRole: user?.role,
      profileRole: profile?.role,
      profileFirstLogin: profile?.first_login,
      profilePlanType: profile?.plan_type,
      hasRunTour
    })

    // Check if profile exists and user is logged in and tour hasn't run yet
    if (profile && user?.id && !hasRunTour) {
      // For Google/LinkedIn login, check both user.role and profile.role
      const userRole = user?.role || profile?.role;
      const isRegularUser = userRole === 'User' || userRole === 'user';
      const isNotProPlan = profile?.plan_type?.toLowerCase() !== 'pro';
      
      console.log('Tour conditions:', {
        isRegularUser,
        isNotProPlan,
        shouldShowTour: isRegularUser && isNotProPlan
      })

      // Show tour for regular users (not Admin) who are not on Pro plan
      // This will run only once because hasRunTour prevents re-running
      if (isRegularUser && isNotProPlan) {
        // Initialize driver.js with your theme
        const driverObj = driver({
          showProgress: true,
          allowClose: true,
          animate: true,
          smoothScroll: true,
          overlayColor: theme === 'dark' ? 'rgba(29, 41, 57, 0.85)' : 'rgba(45, 54, 57, 0.85)',
          showButtons: ['next', 'previous', 'close'],
          nextBtnText: 'Next',
          prevBtnText: 'Back',
          doneBtnText: 'Finish',
          progressText: 'Step {{current}} of {{total}}',
          popoverClass: 'resumaic-driver-popover',

          onDestroyed: () => {
            // Mark tour as completed when finished
            markTourAsCompleted()
          },

          onCloseClick: () => {
            // Also mark when user manually closes the tour
            markTourAsCompleted()
            driverObj.destroy()
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
          console.log('Starting tour...')
          driverObj.drive()
        }, 1500)

        return () => {
          clearTimeout(timer)
        }
      }
    }
  }, [user, theme, profile, dispatch, hasRunTour])

  return null
}