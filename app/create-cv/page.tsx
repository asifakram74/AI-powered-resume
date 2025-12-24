"use client";

import { Suspense } from "react"
import { CVPageClientContent } from "../../components/cv-page/cv-page-client-content"
import { CVPageLoading } from "../../components/cv-page/cv-page-loading"

export default function CreateCVPage() {
  return (
    <>
    <Suspense fallback={<CVPageLoading />}>

      <CVPageClientContent />

    </Suspense>

    </>
  )
}
