import { type SupabaseClient } from "shared";
export declare function add_card(s: {
    front: string | null;
    back: string | null;
    note_id: number;
    supabase: SupabaseClient;
}): Promise<{
    card_content_id: number;
    created_at: string;
    difficulty: number;
    due: string;
    elapsed_days: number;
    id: number;
    lapses: number;
    last_review: string;
    reps: number;
    scheduled_days: number;
    stability: number;
    state: number;
    user_id: string;
} | null>;
//# sourceMappingURL=cards.d.ts.map