import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { v4 as uuid } from 'uuid';
import { ErrorResponse } from '../../../typings/shared';
import {
  abortMultipartUpload,
  completeMultipartUpload,
  generateMultipartUploadURL,
  generatePresignedUrlsParts,
} from '../../../services/presignedUrlsService';
import { isCompletedPartArr } from '../../../utils/validators';

const swaggerFile = require('../../../../swagger_output.json');

const preSignedUrlsRoute = express.Router();

// interface GetQuery {
//   fileName?: string;
//   fileSize?: string;
// }

preSignedUrlsRoute.get(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile),
  async (req: Request, res: Response) => {
    const { fileName, fileSize } = req.query;

    // Validations
    if (typeof fileName !== 'string' || !fileName.trim()) {
      const response: ErrorResponse = {
        error: 'Invalid value in "fileName" query parameter.',
      };

      console.error(response.error);
      res.status(400);
      res.send(response);
      return;
    }

    if (
      typeof fileSize !== 'string' ||
      Number.isNaN(Number.parseInt(fileSize)) ||
      Number.parseInt(fileSize) < 1
    ) {
      const response: ErrorResponse = {
        error: '"fileSize" query parameter must have a positive integer value.',
      };

      console.error(response.error);
      res.status(400);
      res.send(response);
      return;
    }

    console.info('New upload');
    console.info('GET query: ', req.query);

    try {
      // Initialize a multipart upload
      const { s3, objectName, uploadId, expirationDate } = await generateMultipartUploadURL(
        fileName
      );

      // const parts = Number.isSafeInteger(process.env.FILE_PART_SIZE)  ? process.env.;

      // TODO: Move to config file
      const minPartSize = 5 * 1024 * 1024;

      const filePartSize = Number.parseInt(process.env.FILE_PART_SIZE);
      const partsSize =
        !Number.isNaN(filePartSize) && filePartSize >= minPartSize ? filePartSize : minPartSize;
      const parts = Math.ceil(Number.parseInt(fileSize) / partsSize);

      // Create pre-signed URLs for each part
      const urls = await generatePresignedUrlsParts(s3, uploadId, objectName, parts);

      const response = {
        objectName,
        uploadId,
        urls,
        expirationDate,
        partsSize,
      };

      console.info(`Presigned Urls generated for "${objectName}"`);
      res.status(200);
      res.send(response);
    } catch (error) {
      const response: ErrorResponse = {
        error: 'An error occurred when trying to generate pre-signed urls.',
        objectName: fileName,
        internalError: error,
      };

      console.error('Error:', response);
      res.status(500);
      res.send(response);
    }
  }
);

// interface PostBody {
//   uploadId?: string;
//   objectName?: string;
//   parts?: CompletedPart;
// }

preSignedUrlsRoute.post(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile),
  async (req: Request, res: Response) => {
    // TODO: remove objectName
    const { uploadId, objectName, parts } = req.body;

    // Validations
    if (typeof uploadId !== 'string' || typeof objectName !== 'string') {
      const response: ErrorResponse = {
        error: 'Invalid value in "uploadId" or in "objectName" query parameters.',
        objectName,
      };

      console.error('Error:', response);
      res.status(400);
      res.send(response);
      return;
    }

    if (!isCompletedPartArr(parts)) {
      const response: ErrorResponse = {
        error: 'Invalid value in "parts" query parameter. Should be a CompletedPart array.',
        objectName,
      };

      console.error('Error:', response);
      res.status(400);
      res.send(response);
      return;
    }

    if (!uploadId) {
      const response: ErrorResponse = {
        error: '"uploadId" body parameter must have a value.',
        objectName,
      };

      console.error('Error:', response);
      res.status(400);
      res.send(response);
      return;
    }

    if (!objectName) {
      const response: ErrorResponse = {
        error: '"objectName" body parameter must have a value.',
        objectName,
      };

      console.error('Error:', response);
      res.status(400);
      res.send(response);
      return;
    }

    if (!parts) {
      const response: ErrorResponse = {
        error: '"parts" body parameter must have a value.',
        objectName,
      };

      console.error('Error:', response);
      res.status(400);
      res.send(response);
      return;
    }

    // Complete multipart upload
    try {
      // TODO: Verify if const resp is undefined and remove it
      const resp = await completeMultipartUpload(uploadId, objectName, parts);

      const response = {
        status: 'MultipartUpload completed successfully',
        uuid: uuid(),
      };

      console.info(response.status, { resp });
      res.status(201);
      res.send(response);
    } catch (error) {
      const response: ErrorResponse = {
        error: 'An error occurred when trying to complete MultipartUpload.',
        objectName,
        uploadId,
        internalError: error,
      };

      console.error('Error:', response);
      res.status(500);
      res.send(response);
    }
  }
);

// interface PostAbortBody {
//   uploadId?: string;
//   objectName?: string;
// }

preSignedUrlsRoute.post(
  '/abort',
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile),
  async (req: Request, res: Response) => {
    const { uploadId, objectName } = req.body;

    // Validations
    if (typeof uploadId !== 'string' || typeof objectName !== 'string') {
      const response: ErrorResponse = {
        error: 'Invalid value in "uploadId" or in "objectName" query parameters.',
        objectName,
      };

      console.error('Error:', response);
      res.status(400);
      res.send(response);
      return;
    }

    if (!uploadId) {
      const response: ErrorResponse = {
        error: '"uploadId" body parameter must have a value.',
        objectName,
      };

      console.error('Error:', response);
      res.status(400);
      res.send(response);
      return;
    }

    if (!objectName) {
      const response: ErrorResponse = {
        error: '"objectName" body parameter must have a value.',
        objectName,
      };

      console.error('Error:', response);
      res.status(400);
      res.send(response);
      return;
    }

    try {
      await abortMultipartUpload(uploadId, objectName);

      // TODO: Verify if any part still exists using ListParts

      const response = {
        status: 'MultipartUpload aborted successfully',
        uploadId,
        objectName,
      };

      console.info(response.status);
      res.status(200);
      res.send(response);
    } catch (err) {
      res.status(500);
      res.send({
        error: ``,
        Object: objectName,
      });
    }
  }
);

export default preSignedUrlsRoute;
