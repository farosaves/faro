export const ssr = false

export async function load({ params }) {
  const { slug } = params
  return { slug }
}
