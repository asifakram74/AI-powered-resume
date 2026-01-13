"use client"
import { FileText, Mail, Target, UserCircle, TrendingUp } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card"
import { useAppSelector } from "../../lib/redux/hooks"
import { useEffect, useState } from "react"
import { getPersonas } from "../../lib/redux/service/pasonaService"
import { getCVs } from "../../lib/redux/service/resumeService"
import { getCoverLetters } from "../../lib/redux/service/coverLetterService"
import { getATSResumes } from "../../lib/redux/service/atsResumeService"

interface StatItem {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export function StatsCard() {
  const { profile, user } = useAppSelector((state) => state.auth)
  const [stats, setStats] = useState<StatItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const [personas, cvs, coverLetters, atsResumes] = await Promise.all([
          getPersonas(user.id.toString()),
          getCVs(user.id.toString()),
          getCoverLetters(user.id.toString()),
          getATSResumes()
        ])

        setStats([
          {
            label: "Resumes Created",
            value: profile?.cvs_count || cvs.length,
            icon: FileText,
            color: "text-blue-600"
          },
          {
            label: "Cover Letters",
            value: profile?.cover_letters_count || coverLetters.length,
            icon: Mail,
            color: "text-green-600"
          },
          {
            label: "ATS Checks",
            value: profile?.ats_resumes_count || atsResumes.length,
            icon: Target,
            color: "text-orange-600"
          },
          {
            label: "Personas Generated",
            value: personas.length,
            icon: UserCircle,
            color: "text-purple-600"
          },
        ])
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user?.id, profile])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading statistics...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Usage Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
export default StatsCard
