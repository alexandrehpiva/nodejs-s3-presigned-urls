import express from 'express';
import {
  abortMultipartUpload,
  completeMultipartUpload,
  generateMultipartUploadURL,
  generatePresignedUrlsParts,
} from 'services/presignedUrlsService';
import { v4 as uuidv4 } from 'uuid';
import { isCompletedPartArr } from '../../../utils/validators';
import { ErrorResponse } from '../../../typings/shared';

const preSignedUrlsRoute = express.Router();

// async function abort(uploadId: string, objectName: string, res) {
//   try {
//     await abortMultipartUpload(uploadId, objectName);

//     console.info('Aborted: ', { uploadId, objectName });

//     res.status(500);
//     res.send(`Aborted: ${objectName}`);
//     // TODO: Verify if any part still exists using ListParts
//   } catch (err) {
//     res.status(500);
//     res.send(err);
//   }
// }

preSignedUrlsRoute.get('/', async (req, res) => {
  const { parts, fileName } = req.query;

  if (typeof fileName !== 'string' || typeof parts !== 'string') {
    const response: ErrorResponse = {
      error: 'Invalid value in "fileName" or in "parts" query parameters.',
    };

    console.error(response.error);
    res.status(400);
    res.send(response);
    return;
  }

  console.info('New upload');
  console.info('GET query: ', req.query);

  if (Number.parseInt(parts) < 1) {
    const response: ErrorResponse = {
      error: '"parts" query parameter must have a positive numeric value.',
    };

    console.error(response.error);
    res.status(400);
    res.send(response);
  }

  try {
    // Initialize a multipart upload
    const { s3, objectName, uploadId } = await generateMultipartUploadURL(fileName);

    // Create pre-signed URLs for each part
    const urls = await generatePresignedUrlsParts(s3, uploadId, objectName, Number.parseInt(parts));

    const response = {
      uploadId,
      objectName,
      urls,
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
});

preSignedUrlsRoute.post('/', async (req, res) => {
  // TODO: remove objectName
  const { uploadId, objectName, parts } = req.body;

  // Query params validation
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
    const resp = await completeMultipartUpload(uploadId, objectName, parts);

    const response = {
      status: 'MultipartUpload completed successfully',
      uuid: uuidv4(),
    };

    console.info(response.status, { resp });
    res.status(201);
    res.send(response);
  } catch (error) {
    // await abort(uploadId, objectName, res);
    try {
      await abortMultipartUpload(uploadId, objectName);

      console.info('Aborted: ', { uploadId, objectName });
      // TODO: Verify if any part still exists using ListParts
    } catch (err) {
      res.status(500);
      res.send({
        error: ``,
        Object: objectName,
      });
    }

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
});

export default preSignedUrlsRoute;
