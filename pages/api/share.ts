import type {NextApiRequest, NextApiResponse} from 'next';
import {generateImageUrl, generateSessionId, generateShareId} from '../../lib/gen';
import {getRealIp, validateRecaptcha} from '../../lib/req';
import {isHttpError, ValidateError} from '../../lib/error';
import {buildUrl} from '../../lib/s3';
import {ensureString, ensureStringArray} from '../../lib/fields';
import {pool} from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method !== 'POST') {
    res.status(405).send('');
    return;
  }
  const ip = getRealIp(req);
  try {
    if (Boolean(process.env.RE_CAPTCHA_ENABLED !== 'false')) {
      await validateRecaptcha(req, ip);
    }
    validateReq(req);
    const shareResult = await createShare(req, ip);
    res.status(200).send(shareResult);
  } catch (e) {
    if (isHttpError(e)) {
      res.status(e.httpCode).send(e.responseBody);
    } else {
      res.status(500).send({message: (e as any)?.message ?? String(e)});
    }
  }
}

function validateReq(req: NextApiRequest) {
  const body = req.body;
  if (!body) {
    throw new ValidateError('', 'request body is required');
  }
  ensureString(body, 'title');
  ensureString(body, 'description');
  ensureStringArray(body, 'keyword');
  ensureString(body, 'path');
}

interface RequestData {
  title: string;
  description: string;
  keyword: string[];
  path: string;
  meta?: object;
}

interface ShareData extends RequestData {
  id: string;
  imageUrl: string;
  sessionId: string;
}

interface ResponseData {
  shareId: string;
  signedUrl: string;
}

async function saveToDb({id, title, description, keyword, imageUrl, path, meta, sessionId}: ShareData) {
  await pool.execute(
    'INSERT INTO share_data(`id`, `title`, `description`, `keyword`, `image_url`, `path`, `meta`, `session_id`) VALUES (?,?,?,?,?,?,?,?)',
    [id, title, description, keyword.join(','), imageUrl, path, JSON.stringify(meta ?? {}), sessionId]);
}

async function createShare(req: NextApiRequest, ip: string | undefined = 'unknown-ip'): Promise<ResponseData> {
  const body = req.body as RequestData;
  const shareId = generateShareId();
  const sessionId = generateSessionId(req, ip);
  const url = generateImageUrl(shareId, sessionId);

  await saveToDb({
    ...body,
    id: shareId,
    sessionId,
    imageUrl: url,
  });

  const signedUrl = await buildUrl(url);

  return {
    shareId,
    signedUrl,
  };
}
