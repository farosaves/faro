export type Note = {
    context: string | null
    created_at: string
    highlights: string[]
    id: string
    predicted_topic: string | null
    prioritised: number
    quote: string
    referer: string | null
    serialized_highlight: string | null
    snippet_uuid: string | null
    domain: string
    title: string
    tags: string[]
    updated_at: string
    url: string
    user_id: string
    user_note: string | null
}