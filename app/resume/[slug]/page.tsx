import CVCardClient from "./CVCardClient"

export async function generateStaticParams() {
  return [{ slug: 'demo' }]
}

export default async function PublicCVPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <CVCardClient slug={slug} />
}
