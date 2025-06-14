// Generated by ts-to-zod
import { z } from "zod"
import type { Json } from "./types"

export const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.record(z.union([jsonSchema, z.undefined()])),
      z.array(jsonSchema),
    ])
    .nullable(),
)

export const cardsRowSchema = z.object({
  card_content_id: z.number(),
  created_at: z.string(),
  difficulty: z.number(),
  due: z.string(),
  elapsed_days: z.number(),
  id: z.number(),
  lapses: z.number(),
  last_review: z.string(),
  reps: z.number(),
  scheduled_days: z.number(),
  stability: z.number(),
  state: z.number(),
  user_id: z.string(),
})

export const cardsInsertSchema = z.object({
  card_content_id: z.number(),
  created_at: z.string().optional(),
  difficulty: z.number(),
  due: z.string(),
  elapsed_days: z.number(),
  id: z.number().optional(),
  lapses: z.number(),
  last_review: z.string(),
  reps: z.number(),
  scheduled_days: z.number(),
  stability: z.number(),
  state: z.number(),
  user_id: z.string().optional(),
})

export const cardsUpdateSchema = z.object({
  card_content_id: z.number().optional(),
  created_at: z.string().optional(),
  difficulty: z.number().optional(),
  due: z.string().optional(),
  elapsed_days: z.number().optional(),
  id: z.number().optional(),
  lapses: z.number().optional(),
  last_review: z.string().optional(),
  reps: z.number().optional(),
  scheduled_days: z.number().optional(),
  stability: z.number().optional(),
  state: z.number().optional(),
  user_id: z.string().optional(),
})

export const cardsRelationshipsSchema = z.tuple([
  z.object({
    foreignKeyName: z.literal("cards_user_id_fkey"),
    columns: z.tuple([z.literal("user_id")]),
    isOneToOne: z.literal(false),
    referencedRelation: z.literal("users"),
    referencedColumns: z.tuple([z.literal("id")]),
  }),
])

export const emails2sendRowSchema = z.object({
  created_at: z.string(),
  email: z.string(),
  id: z.number(),
})

export const emails2sendInsertSchema = z.object({
  created_at: z.string().optional(),
  email: z.string(),
  id: z.number().optional(),
})

export const emails2sendUpdateSchema = z.object({
  created_at: z.string().optional(),
  email: z.string().optional(),
  id: z.number().optional(),
})

export const emails2sendRelationshipsSchema = z.tuple([])

export const keysRowSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  key: z.array(z.number()).nullable(),
  user_id: z.string(),
  using_derived: z.boolean(),
  using_stored: z.boolean(),
})

export const keysInsertSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  key: z.array(z.number()).optional().nullable(),
  user_id: z.string().optional(),
  using_derived: z.boolean().optional(),
  using_stored: z.boolean().optional(),
})

export const keysUpdateSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  key: z.array(z.number()).optional().nullable(),
  user_id: z.string().optional(),
  using_derived: z.boolean().optional(),
  using_stored: z.boolean().optional(),
})

export const keysRelationshipsSchema = z.tuple([
  z.object({
    foreignKeyName: z.literal("keys_user_id_fkey"),
    columns: z.tuple([z.literal("user_id")]),
    isOneToOne: z.literal(true),
    referencedRelation: z.literal("users"),
    referencedColumns: z.tuple([z.literal("id")]),
  }),
])

export const mylogsRowSchema = z.object({
  created_at: z.string(),
  from: z.string(),
  id: z.number(),
  msg: jsonSchema,
  severity: z.string(),
  user_id: z.string().nullable(),
  where: z.string(),
})

export const mylogsInsertSchema = z.object({
  created_at: z.string().optional(),
  from: z.string(),
  id: z.number().optional(),
  msg: jsonSchema,
  severity: z.string(),
  user_id: z.string().optional().nullable(),
  where: z.string(),
})

export const mylogsUpdateSchema = z.object({
  created_at: z.string().optional(),
  from: z.string().optional(),
  id: z.number().optional(),
  msg: jsonSchema.optional(),
  severity: z.string().optional(),
  user_id: z.string().optional().nullable(),
  where: z.string().optional(),
})

export const mylogsRelationshipsSchema = z.tuple([
  z.object({
    foreignKeyName: z.literal("mylogs_user_id_fkey"),
    columns: z.tuple([z.literal("user_id")]),
    isOneToOne: z.literal(false),
    referencedRelation: z.literal("users"),
    referencedColumns: z.tuple([z.literal("id")]),
  }),
])

export const notesRowSchema = z.object({
  context: z.string().nullable(),
  created_at: z.string(),
  highlights: z.array(z.string()),
  id: z.string(),
  predicted_topic: z.string().nullable(),
  prioritised: z.number(),
  quote: z.string(),
  referer: z.string().nullable(),
  serialized_highlight: z.string().nullable(),
  snippet_uuid: z.string().nullable(),
  source_id: z.string(),
  tags: z.array(z.string()),
  updated_at: z.string(),
  url: z.string(),
  user_id: z.string(),
  user_note: z.string().nullable(),
})

export const notesInsertSchema = z.object({
  context: z.string().optional().nullable(),
  created_at: z.string().optional(),
  highlights: z.array(z.string()),
  id: z.string(),
  predicted_topic: z.string().optional().nullable(),
  prioritised: z.number().optional(),
  quote: z.string(),
  referer: z.string().optional().nullable(),
  serialized_highlight: z.string().optional().nullable(),
  snippet_uuid: z.string().optional().nullable(),
  source_id: z.string(),
  tags: z.array(z.string()).optional(),
  updated_at: z.string().optional(),
  url: z.string(),
  user_id: z.string().optional(),
  user_note: z.string().optional().nullable(),
})

export const notesUpdateSchema = z.object({
  context: z.string().optional().nullable(),
  created_at: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  id: z.string().optional(),
  predicted_topic: z.string().optional().nullable(),
  prioritised: z.number().optional(),
  quote: z.string().optional(),
  referer: z.string().optional().nullable(),
  serialized_highlight: z.string().optional().nullable(),
  snippet_uuid: z.string().optional().nullable(),
  source_id: z.string().optional(),
  tags: z.array(z.string()).optional(),
  updated_at: z.string().optional(),
  url: z.string().optional(),
  user_id: z.string().optional(),
  user_note: z.string().optional().nullable(),
})

export const notesRelationshipsSchema = z.tuple([
  z.object({
    foreignKeyName: z.literal("notes_user_id_fkey"),
    columns: z.tuple([z.literal("user_id")]),
    isOneToOne: z.literal(false),
    referencedRelation: z.literal("users"),
    referencedColumns: z.tuple([z.literal("id")]),
  }),
  z.object({
    foreignKeyName: z.literal("public_notes_source_id_fkey"),
    columns: z.tuple([z.literal("source_id")]),
    isOneToOne: z.literal(false),
    referencedRelation: z.literal("sources"),
    referencedColumns: z.tuple([z.literal("id")]),
  }),
])

export const partingMsgsRowSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  message: z.string(),
})

export const partingMsgsInsertSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  message: z.string(),
})

export const partingMsgsUpdateSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  message: z.string().optional(),
})

export const partingMsgsRelationshipsSchema = z.tuple([])

export const profilesRowSchema = z.object({
  avatar_url: z.string().nullable(),
  full_name: z.string().nullable(),
  id: z.string(),
  requestedNoPrompt: z.boolean(),
  updated_at: z.string().nullable(),
  username: z.string().nullable(),
  website: z.string().nullable(),
})

export const profilesInsertSchema = z.object({
  avatar_url: z.string().optional().nullable(),
  full_name: z.string().optional().nullable(),
  id: z.string(),
  requestedNoPrompt: z.boolean().optional(),
  updated_at: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
})

export const profilesUpdateSchema = z.object({
  avatar_url: z.string().optional().nullable(),
  full_name: z.string().optional().nullable(),
  id: z.string().optional(),
  requestedNoPrompt: z.boolean().optional(),
  updated_at: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
})

export const profilesRelationshipsSchema = z.tuple([
  z.object({
    foreignKeyName: z.literal("profiles_id_fkey"),
    columns: z.tuple([z.literal("id")]),
    isOneToOne: z.literal(true),
    referencedRelation: z.literal("users"),
    referencedColumns: z.tuple([z.literal("id")]),
  }),
])

export const redemptionCodesRowSchema = z.object({
  assigned_to: z.string().nullable(),
  code: z.string(),
})

export const redemptionCodesInsertSchema = z.object({
  assigned_to: z.string().optional().nullable(),
  code: z.string(),
})

export const redemptionCodesUpdateSchema = z.object({
  assigned_to: z.string().optional().nullable(),
  code: z.string().optional(),
})

export const redemptionCodesRelationshipsSchema = z.tuple([
  z.object({
    foreignKeyName: z.literal("redemption_codes_assigned_to_fkey"),
    columns: z.tuple([z.literal("assigned_to")]),
    isOneToOne: z.literal(false),
    referencedRelation: z.literal("users"),
    referencedColumns: z.tuple([z.literal("id")]),
  }),
])

export const savesRowSchema = z.object({
  created_at: z.string(),
  encrypted_data: z.array(z.number()),
  id: z.string(),
  updated_at: z.string(),
  user_id: z.string(),
})

export const savesInsertSchema = z.object({
  created_at: z.string().optional(),
  encrypted_data: z.array(z.number()),
  id: z.string(),
  updated_at: z.string().optional(),
  user_id: z.string().optional(),
})

export const savesUpdateSchema = z.object({
  created_at: z.string().optional(),
  encrypted_data: z.array(z.number()).optional(),
  id: z.string().optional(),
  updated_at: z.string().optional(),
  user_id: z.string().optional(),
})

export const savesRelationshipsSchema = z.tuple([
  z.object({
    foreignKeyName: z.literal("saves_user_id_fkey"),
    columns: z.tuple([z.literal("user_id")]),
    isOneToOne: z.literal(false),
    referencedRelation: z.literal("users"),
    referencedColumns: z.tuple([z.literal("id")]),
  }),
])

export const sourcesRowSchema = z.object({
  created_at: z.string(),
  DOI: z.string().nullable(),
  domain: z.string().nullable(),
  id: z.string(),
  title: z.string().nullable(),
})

export const sourcesInsertSchema = z.object({
  created_at: z.string().optional(),
  DOI: z.string().optional().nullable(),
  domain: z.string().optional().nullable(),
  id: z.string(),
  title: z.string().optional().nullable(),
})

export const sourcesUpdateSchema = z.object({
  created_at: z.string().optional(),
  DOI: z.string().optional().nullable(),
  domain: z.string().optional().nullable(),
  id: z.string().optional(),
  title: z.string().optional().nullable(),
})

export const sourcesRelationshipsSchema = z.tuple([])
