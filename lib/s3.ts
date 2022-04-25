import S3 from 'aws-sdk/clients/s3'

const KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? ''
const KEY_SECRET = process.env.AWS_ACCESS_KEY_SECRET ?? ''
const REGION = process.env.AWS_S3_REGION ?? ''
const BUCKET = process.env.AWS_S3_BUCKET ?? ''
const EXPIRES = Number(process.env.AWS_S3_UPLOAD_URL_EXPIRES_SECONDS) || 1800
const MIN_SIZE = 1
const MAX_SIZE = 1048576

export const s3 = new S3({
  credentials: {
    accessKeyId: KEY_ID,
    secretAccessKey: KEY_SECRET
  },
  region: REGION,
})


export function buildUrl(url: string): S3.PresignedPost {
  return s3.createPresignedPost({
    Bucket: BUCKET,
    Expires: EXPIRES,
    Conditions: [
      {"bucket": BUCKET },
      ["eq", "$Content-Type", "image/png"],
      ["content-length-range", MIN_SIZE, MAX_SIZE]
    ],
    Fields: {
      key: url
    }
  })
}
