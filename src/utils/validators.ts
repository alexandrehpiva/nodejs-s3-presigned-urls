/* eslint-disable @typescript-eslint/no-explicit-any */
import { CompletedPart } from 'aws-sdk/clients/s3';

export function isCompletedPart(obj: any): obj is CompletedPart {
  return 'ETag' in obj && 'PartNumber' in obj;
}

export function isCompletedPartArr(obj: any): obj is CompletedPart[] {
  return obj?.every?.((p: CompletedPart) => isCompletedPart(p));
}
