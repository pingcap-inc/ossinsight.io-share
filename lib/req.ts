import {NextApiRequest, NextApiResponse} from 'next';
import fetch, {FormData} from 'node-fetch';
import {Ipware} from '@fullerstack/nax-ipware';
import {HttpError} from './error';

const ipware = new Ipware();

export function getRealIp(req: NextApiRequest): string | undefined {
  return ipware.getClientIP(req)?.ip;
}

interface ValidateResult {
  success: boolean;
  challenge_ts: number;
  hostname: string;
  'error-codes'?: string[];
}

export async function validateRecaptcha(req: NextApiRequest, ip: string | undefined) {
  const data = new FormData();
  data.set('secret', process.env.RE_CAPTCHA_SECRET ?? '');
  data.set('response', String(req.headers['x-recaptcha-response'] ?? ''));
  if (ip) {
    data.set('remoteip', ip);
  }
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'post',
    body: data,
    agent: process.env.https_proxy ? new (require('proxy-agent') as any)(process.env.https_proxy) : undefined
  });
  const validateData: ValidateResult = await res.json() as any;
  if (!validateData.success) {
    throw new RecaptchaValidationError(validateData);
  }
}

export class RecaptchaValidationError extends HttpError {
  constructor(result: ValidateResult) {
    super('recaptcha validation failed', 401, result);
  }
}
