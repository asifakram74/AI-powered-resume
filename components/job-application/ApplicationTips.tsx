
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { TrendingUp, MoveRight, Calendar, FileText } from "lucide-react"

export function ApplicationTips() {
  return (
    <Card className="border-[#70E4A8]/25 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-semibold text-gray-900 dark:text-gray-100">
          <div className="p-2 bg-gradient-to-br from-[#70E4A8] to-[#EA580C] rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          Tracking Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-[#70E4A8]/20 p-3">
              <MoveRight className="h-5 w-5 text-[#70E4A8]" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Drag & Drop</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Move applications between stages by dragging
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-[#EA580C]/20 p-3">
              <Calendar className="h-5 w-5 text-[#EA580C]" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Stay Updated</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Regularly update application status and dates
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-[#3B82F6]/20 p-3">
              <FileText className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Attach CVs</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Link specific resumes to each application
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
