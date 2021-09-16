import { promisify } from 'util';
import crypto from 'crypto';
import aws from 'aws-sdk';
import { CompletedPart } from 'aws-sdk/clients/s3';
import { defaultUrlsExpirationTime } from '../config/s3Config';

const randomBytes = promisify(crypto.randomBytes);

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;
const config: aws.S3.ClientConfiguration = {
  ...(accessKeyId &&
    secretAccessKey && {
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      ...(region && { region }),
    }),
  signatureVersion: 'v4',
};

export async function generateMultipartUploadURL(fileName: string) {
  const s3 = new aws.S3(config);

  const rawBytes = await randomBytes(4);
  const objectName = fileName ?? rawBytes.toString('hex');

  const Expires = new Date(
    new Date().getTime() +
      Number(process.env.AWS_S3_URLS_EXPIRATION_TIME ?? defaultUrlsExpirationTime) * 1000
  );

  const params: aws.S3.CreateMultipartUploadRequest = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: objectName,
    Expires,
  };

  const response = await s3.createMultipartUpload(params).promise();

  return {
    s3,
    objectName,
    uploadId: response.UploadId,
    expirationDate: Expires.toISOString(),
  };
}

export async function generatePresignedUrlsParts(
  s3: aws.S3,
  uploadId: string,
  objectName: string,
  parts: number
) {
  const baseParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: objectName,
    UploadId: uploadId,
  };

  const promises = [];

  for (let index = 0; index < parts; index++) {
    promises.push(
      s3.getSignedUrlPromise('uploadPart', {
        ...baseParams,
        PartNumber: index + 1,
      })
    );
  }

  const res = await Promise.all(promises);

  return res.reduce((map, part, index) => {
    map[index] = part;
    return map;
  }, {});
}

export async function completeMultipartUpload(
  uploadId: string,
  objectName: string,
  parts: CompletedPart[]
) {
  const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion: 'v4',
  });

  const params: aws.S3.CompleteMultipartUploadRequest = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: objectName,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  };

  await s3.completeMultipartUpload(params).promise();
}

export async function abortMultipartUpload(uploadId: string, objectName: string) {
  const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion: 'v4',
  });

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: objectName,
    UploadId: uploadId,
  };

  try {
    await s3.abortMultipartUpload(params).promise();
  } catch (error) {
    console.error('Error on abortMultipartUpload: ' + error);
    // TODO: Create an error provider class
    throw new Error(error);
  }
}
