export type ErrorResponse = Record<string, unknown> & {
  error: string;
  objectName?: string;
  internalError?: unknown;
};
