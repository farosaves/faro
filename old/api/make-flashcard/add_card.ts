import type { SupabaseClient } from "shared"
import { ts } from "$root/src/lib/utils"
import { Card, FSRS } from "fsrs.js"

export function makeCloze(selectedText: string, contextText: string) {
  return {
    front: contextText.replace(selectedText, "{{c1:" + selectedText + "}}"),
    back: null,
  }
}

async function add_card(
  front: string,
  back: string | null,
  note_id: number,
  supabase: SupabaseClient,
) {
  const fsrs = new FSRS()
  let card = new Card()
  card = fsrs.repeat(card, new Date())[1].card // 1 is 'Again'
  const card_content = (
    await supabase.from("card_contents").insert({ front, back, note_id }).select().maybeSingle()
  ).data
  if (!card_content) return null
  const saved_card = (
    await supabase
      .from("cards")
      .insert({ card_content_id: card_content.id, ...ts(card) })
      .select()
      .maybeSingle()
  ).data
  return saved_card
}
