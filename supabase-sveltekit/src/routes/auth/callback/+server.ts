// src/routes/auth/callback/+server.ts
import { redirect } from "@sveltejs/kit";
import { isAuthApiError } from "@supabase/supabase-js";
import type { ViewType } from "@supabase/auth-ui-shared";
import { match, P } from "ts-pattern";

export const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get("code");
  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      // If you open in another browser, need to redirect to login.
      // Should not display error
      if (isAuthApiError(error)) {
        throw redirect(303, "/login?verified=true");
      } else {
        throw error;
      }
    }
  }
  const view = url.searchParams.get("view") as ViewType;
  match(view)
    .with(P.union("forgotten_password", "update_password"), () => {
      throw redirect(303, "/account/reset-password");
    })
    .with("sign_up", () => {
      throw redirect(303, "/account/reset-password?new");
    })
    .with("magic_link", () => {
      throw redirect(303, "/account");
    });
  throw redirect(303, "/dashboard");
};
