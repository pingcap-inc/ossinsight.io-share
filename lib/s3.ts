import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? '';
const KEY_SECRET = process.env.AWS_ACCESS_KEY_SECRET ?? '';
const REGION = process.env.AWS_S3_REGION ?? '';
const BUCKET = process.env.AWS_S3_BUCKET ?? '';
const EXPIRES = Number(process.env.AWS_S3_UPLOAD_URL_EXPIRES_SECONDS) || 1800;

export const s3 = new S3Client({
  credentials: {
    accessKeyId: KEY_ID,
    secretAccessKey: KEY_SECRET,
  },
  region: REGION,
});

export async function buildUrl(url: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: url.replace(/^\//, ''),
    ContentType: 'image/png'
  })

  return getSignedUrl(s3, command, { expiresIn: EXPIRES })
}
