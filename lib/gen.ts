import { v4 as uuid } from 'uuid';
import {createHash} from 'crypto';
import {NextApiRequest} from 'next';
import {getRealIp} from './req';

function format(date: Date): string {
  const now = new Date()
  const yyyy = String(now.getUTCFullYear())
  const MM = String(now.getUTCMonth() + 1)
  const dd = String(now.getUTCDate())

  return `${yyyy}${MM.padStart(2, '0')}${dd.padStart(2, '0')}`
}

export function generateImageUrl (shareId: string, sessionId: string): string {
  const dateStr = format(new Date())

  return `/${dateStr}/${sessionId}/${shareId}.png`
}

export function generateShareId (): string {
  return uuid()
}

export function generateSessionId (req: NextApiRequest, ip: string): string {
  return createHash('md5')
    .update(ip)
    .update(req.headers['user-agent'] ?? 'unknown-agent')
    .digest('hex')
}