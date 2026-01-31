import CoverLetterClient from "./CoverLetterClient"

export async function generateStaticParams() {
  return [{ slug: 'demo' }]
}

export default async function PublicCoverLetterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <CoverLetterClient slug={slug} />
}
