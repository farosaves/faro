// import type { SupabaseClient } from "@supabase/supabase-js";
import { fail } from "@sveltejs/kit"
// import type { SupabaseClient } from "shared";
// import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "$env/static/private";
// import { writeFileSync } from 'fs';

export const actions = {
  default: async ({ request, locals }) => {
    // const endpoint =
    //   "https://362e2d4a4b780aab43b3c82f2a779a47.r2.cloudflarestorage.com";

    const formData = Object.fromEntries(await request.formData())
    // const totallyS3 = new S3Client({
    //   endpoint,
    //   region: "EEUR",
    //   credentials: {
    //     accessKeyId: AWS_ACCESS_KEY_ID,
    //     secretAccessKey: AWS_SECRET_ACCESS_KEY,
    //   },
    // });
    // console.log(totallyS3);
    const { fileToUpload } = formData as { fileToUpload: File }
    if (
      !(fileToUpload as File).name ||
      (fileToUpload as File).name === "undefined" // handle html here
    ) {
      return fail(400, {
        error: true,
        message: "You must provide a file to upload",
      })
    }

    // prettier-ignore
    type T = {pdf_id: string, error: string}
    const { pdf_id, error }: T = await (
      await fetch("http://127.0.0.1:2227/", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        body: Buffer.from(await fileToUpload.arrayBuffer()),
      })
    ).json()

    if (error) return { success: false, error }

    // or make pdf table
    await locals.supabase.from("sources").insert({
      url: pdf_id + ".html",
      domain: "pdf",
      title: fileToUpload.name,
    })

    return { success: true, pdf_id }

    // const res = await bucket.put(fileToUpload.name, Buffer.from(await fileToUpload.arrayBuffer()), {
    //   httpMetadata: { 'Content-Type': fileToUpload.type }
    // });
    // console.log(res)

    // writeFileSync(`static/${fileToUpload.name}`, Buffer.from(await fileToUpload.arrayBuffer()));
  },
}
