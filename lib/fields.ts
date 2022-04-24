import {ValidateError} from './error';

export function ensureString(body: any, field: string) {
  if (typeof body[field] !== 'string' || !body[field]) {
    throw new ValidateError(field, 'should be a string')
  }
}

export function ensureStringArray(body: any, field: string) {
  const arr: any[] = body[field]
  if (!arr) {
    throw new ValidateError(field, 'should be a string array')
  }
  for (const item of arr) {
    if (typeof item !== 'string' || !item) {
      throw new ValidateError(field, 'should be a string array')
    }
  }
}