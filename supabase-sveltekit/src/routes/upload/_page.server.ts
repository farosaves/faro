
// import { randomUUID } from "node:crypto"
// import { resolvePDFJS } from "pdfjs-serverless"
// import { uuidv5 } from "shared"
// import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
// import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "$env/static/private"

// // AWS.config.update({ region: "eeur" })
// const s3 = new S3Client({ region: "auto", endpoint: "https://362e2d4a4b780aab43b3c82f2a779a47.r2.cloudflarestorage.com",
//   credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } })

// // @ts-ignore
// export const actions = {
//   default: async ({ request, locals }) => {
//     if (request.method !== "POST")
//       return { success: false, error: "not post?" }

//     const formData = Object.fromEntries(await request.formData())
//     const { fileToUpload } = formData as { fileToUpload: File }
//     // Get the PDF file from the POST request body as a buffer
//     // const data = await request.arrayBuffer()
//     // here get from a form
//     const data = await fileToUpload.arrayBuffer()

//     // Initialize PDF.js
//     const { getDocument } = await resolvePDFJS()
//     const doc = await getDocument({
//       data,
//       useSystemFonts: true,
//     }).promise

//     // Get metadata and initialize output object
//     const metadata = await doc.getMetadata()
//     const output = {
//       metadata,
//       pages: [] as unknown[],
//     }

//     // Iterate through each page and fetch the text content
//     for (let i = 1; i <= doc.numPages; i++) {
//       const page = await doc.getPage(i)
//       const textContent = await page.getTextContent()
//       // @ts-expect-error
//       const contents = textContent.items.map(item => item.str).join(" ")
//       // Add page content to output
//       output.pages.push({
//         pageNumber: i,
//         content: contents,
//       })
//     }
//     const uuid = randomUUID()
//     console.log(
//       await s3.send(
//         new GetObjectCommand({ Bucket: "pdf2html", Key: "0f96442f-074d-4b32-9640-78dd3fb56169" + ".html" }),
//       ),
//     )


//     await locals.supabase.from("sources").insert({
//       url: uuid + ".html",
//       domain: "pdf",
//       title: fileToUpload.name,
//       id: uuidv5("pdf;" + fileToUpload.name),
//     })
//     return { success: true, output }
//   },
// }
