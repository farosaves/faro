// import { compressSync, strToU8 } from "fflate"
// import aws from "aws-sdk"

// const { S3 } = aws
// // import { S3 } from "aws-sdk"
// import type { UUID } from "crypto"
// import { funLog } from "shared"
// const s3 = new S3({
//   endpoint: "https://362e2d4a4b780aab43b3c82f2a779a47.r2.cloudflarestorage.com",
//   region: "eeur",
// })

// export const uploadMHTML = async (mhtml: string, id: UUID) => {
//   const bytes = compressSync(strToU8(mhtml))
//   s3.putObject({ Bucket: "mhtml", Key: id + ".mhtml.zip", Body: bytes }, funLog("uploadMHTML"))
// }
