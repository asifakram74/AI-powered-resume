
import { Card, CardContent } from "../../components/ui/card"
import { Briefcase, CheckCircle, Users, Award } from "lucide-react"

interface ApplicationStatsProps {
  stats: {
    total: number
    wishlist: number
    applied: number
    interview: number
    offer: number
    rejected: number
  }
}

export function ApplicationStats({ stats }: ApplicationStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-[#70E4A8]/25 hover:shadow-lg transition-shadow duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Applications</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#70E4A8]/10">
              <Briefcase className="h-5 w-5 text-[#70E4A8]" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-[#3B82F6]/25 hover:shadow-lg transition-shadow duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Applied</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.applied}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#3B82F6]/10">
              <CheckCircle className="h-5 w-5 text-[#3B82F6]" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-[#8B5CF6]/25 hover:shadow-lg transition-shadow duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Interviews</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.interview}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#8B5CF6]/10">
              <Users className="h-5 w-5 text-[#8B5CF6]" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-[#10B981]/25 hover:shadow-lg transition-shadow duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Offers</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.offer}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#10B981]/10">
              <Award className="h-5 w-5 text-[#10B981]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
