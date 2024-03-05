import { fail } from "@sveltejs/kit";
// import { writeFileSync } from 'fs';

export const actions = {
  default: async ({ request, platform }) => {

    const formData = Object.fromEntries(await request.formData());
    const bucket = platform?.env?.pdf2html
    if (
      !(formData.fileToUpload as File).name ||
      (formData.fileToUpload as File).name === "undefined"
    ) {
      return fail(400, {
        error: true,
        message: "You must provide a file to upload",
      });
    }

    const { fileToUpload } = formData as { fileToUpload: File };

    const res = await bucket.put(fileToUpload.name, Buffer.from(await fileToUpload.arrayBuffer()), { 
      httpMetadata: { 'Content-Type': fileToUpload.type } 
    });
    console.log(res)

    // writeFileSync(`static/${fileToUpload.name}`, Buffer.from(await fileToUpload.arrayBuffer()));
  },
};
