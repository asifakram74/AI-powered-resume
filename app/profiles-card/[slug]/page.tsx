import ProfileCardPublicClient from "./ProfileCardPublicClient"

export default async function PublicProfileCardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ProfileCardPublicClient slug={slug} />
}
