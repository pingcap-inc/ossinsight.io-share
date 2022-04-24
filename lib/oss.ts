import OSS from 'ali-oss';
import {generateImageUrl} from './gen';

const client = new OSS({
  accessKeyId: process.env.ALI_ACCESS_KEY ?? '',
  accessKeySecret: process.env.ALI_SECRET_KEY ?? '',
  region: process.env.ALI_OSS_REGION,
  bucket: process.env.ALI_OSS_BUCKET,
  secure: true
});

export function buildUrl(url: string): string {
  return client.signatureUrl(url, {
    expires: Number(process.env.ALI_OSS_UPLOAD_URL_EXPIRES_SECONDS) || 1800,
    method: 'PUT',
    'Content-Type': 'image/png',
  });
}

