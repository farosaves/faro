import { fail } from "@sveltejs/kit";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "$env/static/private";
// import { writeFileSync } from 'fs';

export const actions = {
  default: async ({ request }) => {
    const endpoint =
      "https://362e2d4a4b780aab43b3c82f2a779a47.r2.cloudflarestorage.com";

    const formData = Object.fromEntries(await request.formData());
    const totallyS3 = new S3Client({
      endpoint,
      region: "EEUR",
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log(totallyS3);
    const { fileToUpload } = formData as { fileToUpload: File };
    if (
      !(fileToUpload as File).name ||
      (fileToUpload as File).name === "undefined" ||
      fileToUpload.type !== "application/pdf"
    ) {
      return fail(400, {
        error: true,
        message: "You must provide a file to upload",
      });
    }

    // prettier-ignore
    fetch("http://127.0.0.1:2227/", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      body: Buffer.from(await fileToUpload.arrayBuffer())
    })
    // const cmd2 = new PutObjectCommand({Bucket: "pdf2html", Key: fileToUpload.name, Body: Buffer.from(await fileToUpload.arrayBuffer())})
    // let errored = false
    // await totallyS3.send(cmd2).then(console.log).catch(e => errored=true)
    // if (errored) return fail(400, {
    //   error: true,
    //   message: "R2 error",
    // });


    return {success: true}
    // const res = await bucket.put(fileToUpload.name, Buffer.from(await fileToUpload.arrayBuffer()), {
    //   httpMetadata: { 'Content-Type': fileToUpload.type }
    // });
    // console.log(res)

    // writeFileSync(`static/${fileToUpload.name}`, Buffer.from(await fileToUpload.arrayBuffer()));
  },
};
