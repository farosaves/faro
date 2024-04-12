export declare const t: {
    _config: import("@trpc/server").RootConfig<{
        ctx: any;
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>;
    procedure: import("@trpc/server").ProcedureBuilder<{
        _config: import("@trpc/server").RootConfig<{
            ctx: any;
            meta: object;
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        }>;
        _ctx_out: any;
        _input_in: typeof import("@trpc/server").unsetMarker;
        _input_out: typeof import("@trpc/server").unsetMarker;
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
        _meta: object;
    }>;
    middleware: <TNewParams extends import("@trpc/server").ProcedureParams<import("@trpc/server").AnyRootConfig, unknown, unknown, unknown, unknown, unknown, unknown>>(fn: import("@trpc/server").MiddlewareFunction<{
        _config: import("@trpc/server").RootConfig<{
            ctx: any;
            meta: object;
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        }>;
        _ctx_out: {};
        _input_out: typeof import("@trpc/server").unsetMarker;
        _input_in: unknown;
        _output_in: unknown;
        _output_out: unknown;
        _meta: object;
    }, TNewParams>) => import("@trpc/server").MiddlewareBuilder<{
        _config: import("@trpc/server").RootConfig<{
            ctx: any;
            meta: object;
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        }>;
        _ctx_out: {};
        _input_out: typeof import("@trpc/server").unsetMarker;
        _input_in: unknown;
        _output_in: unknown;
        _output_out: unknown;
        _meta: object;
    }, TNewParams>;
    router: <TProcRouterRecord extends import("@trpc/server").ProcedureRouterRecord>(procedures: TProcRouterRecord) => import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: any;
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, TProcRouterRecord>;
    mergeRouters: typeof import("@trpc/server").mergeRouters;
    createCallerFactory: <TRouter extends import("@trpc/server").Router<import("@trpc/server").AnyRouterDef<import("@trpc/server").RootConfig<{
        ctx: any;
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, any>>>(router: TRouter) => import("@trpc/server").RouterCaller<TRouter["_def"]>;
};
export declare const router: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
    ctx: any;
    meta: object;
    errorShape: import("@trpc/server").DefaultErrorShape;
    transformer: import("@trpc/server").DefaultDataTransformer;
}>, {
    my_tokens: import("@trpc/server").BuildProcedure<"query", {
        _config: import("@trpc/server").RootConfig<{
            ctx: any;
            meta: object;
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        }>;
        _meta: object;
        _ctx_out: any;
        _input_in: typeof import("@trpc/server").unsetMarker;
        _input_out: typeof import("@trpc/server").unsetMarker;
        _output_in: {
            access_token: string;
            refresh_token: string;
        } | undefined;
        _output_out: {
            access_token: string;
            refresh_token: string;
        } | undefined;
    }, unknown>;
    singleNote: import("@trpc/server").BuildProcedure<"query", {
        _config: import("@trpc/server").RootConfig<{
            ctx: any;
            meta: object;
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        }>;
        _meta: object;
        _ctx_out: any;
        _input_in: string;
        _input_out: string;
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, import("@supabase/supabase-js").PostgrestSingleResponse<{
        context: string | null;
        created_at: string;
        highlights: string[];
        id: string;
        predicted_topic: string | null;
        prioritised: number;
        quote: string;
        serialized_highlight: string | null;
        snippet_uuid: string | null;
        source_id: string;
        tags: string[];
        url: string;
        user_id: string;
        user_note: string | null;
    }>>;
    create_card: import("@trpc/server").BuildProcedure<"mutation", {
        _config: import("@trpc/server").RootConfig<{
            ctx: any;
            meta: object;
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        }>;
        _meta: object;
        _ctx_out: any;
        _input_in: {
            front: string | null;
            back: string | null;
            note_id: number;
        };
        _input_out: {
            front: string | null;
            back: string | null;
            note_id: number;
        };
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, {
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
    note2card: import("@trpc/server").BuildProcedure<"mutation", {
        _config: import("@trpc/server").RootConfig<{
            ctx: any;
            meta: object;
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        }>;
        _meta: object;
        _ctx_out: any;
        _input_in: {
            note_id: number;
        };
        _input_out: {
            note_id: number;
        };
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, {
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
}>;
export type Router = typeof router;
//# sourceMappingURL=router.d.ts.map