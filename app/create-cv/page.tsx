import { Suspense } from "react"
import { CVPageClientContent, CVPageLoading } from "../../components/cv-page/cv-page-client-content"

export default function CreateCVPage() {
  return (
    <Suspense fallback={<CVPageLoading />}>
      <CVPageClientContent />
    </Suspense>
  )
}
