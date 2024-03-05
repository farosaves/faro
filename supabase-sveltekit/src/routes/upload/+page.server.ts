import { fail } from "@sveltejs/kit";
import {
  S3Client,
  ListObjectsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "$env/static/private";
// import { writeFileSync } from 'fs';

export const actions = {
  default: async ({ request, platform }) => {
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
    const cmd = new ListObjectsCommand({ Bucket: "pdf2html" });
    totallyS3.send(cmd).then((e) => e.$metadata);
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

    // ContentType: fileToUpload.type // ContentType: 'application/pdf'
    // prettier-ignore
    const cmd2 = new PutObjectCommand({Bucket: "pdf2html", Key: fileToUpload.name, Body: Buffer.from(await fileToUpload.arrayBuffer())})

    // const res = await bucket.put(fileToUpload.name, Buffer.from(await fileToUpload.arrayBuffer()), {
    //   httpMetadata: { 'Content-Type': fileToUpload.type }
    // });
    // console.log(res)

    // writeFileSync(`static/${fileToUpload.name}`, Buffer.from(await fileToUpload.arrayBuffer()));
  },
};
