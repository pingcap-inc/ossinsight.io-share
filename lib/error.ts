export class HttpError extends Error {
  constructor(message: string, public httpCode: number, public responseBody: any) {
    super(message);
  }
}

export class ValidateError extends HttpError {
  constructor(field: string, message: string) {
    super(`validation failed for field '${field}': ${message}`, 400, { field, message });
  }
}

export function isHttpError(e: unknown): e is HttpError {
  return typeof (e as any).httpCode === 'number'
}
