
import { resolvePDFJS } from "pdfjs-serverless"

export const actions = {
  default: async ({ request, locals }) => {
    if (request.method !== "POST")
      return new Response("Method Not Allowed", { status: 405 })

    const formData = Object.fromEntries(await request.formData())
    const { fileToUpload } = formData as { fileToUpload: File }
    // Get the PDF file from the POST request body as a buffer
    // const data = await request.arrayBuffer()
    // here get from a form
    const data = await fileToUpload.arrayBuffer()

    // Initialize PDF.js
    const { getDocument } = await resolvePDFJS()
    const doc = await getDocument({
      data,
      useSystemFonts: true,
    }).promise

    // Get metadata and initialize output object
    const metadata = await doc.getMetadata()
    const output = {
      metadata,
      pages: [] as unknown[],
    }

    // Iterate through each page and fetch the text content
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const textContent = await page.getTextContent()
      // @ts-expect-error
      const contents = textContent.items.map(item => item.str).join(" ")

      // Add page content to output
      output.pages.push({
        pageNumber: i,
        content: contents,
      })
    }

    // Return the results as JSON
    return output
  },
}
