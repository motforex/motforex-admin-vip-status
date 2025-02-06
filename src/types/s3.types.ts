import { z } from 'zod';

export const S3UploadSignedUrlRequestSchema = z.object({
  bucketName: z.string(),
  email: z.string(),
  fileType: z.string(),
  filePath: z.string(),
  requestId: z.number(),
});

export type S3UploadSignedUrlRequest = z.infer<typeof S3UploadSignedUrlRequestSchema>;

export const S3SignedUrlResponseSchema = z.object({
  filePath: z.string(),
  signedUrl: z.string(),
});

export type S3SignedUrlResponse = z.infer<typeof S3SignedUrlResponseSchema>;

export const S3DownloadSignedUrlRequest = z.object({
  bucketName: z.string(),
  filePath: z.string(),
});

export type S3DownloadSignedUrlRequest = z.infer<typeof S3DownloadSignedUrlRequest>;

export const SignedUrlUploadParamsSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.string(),
});

export type SignedUrlUploadParams = z.infer<typeof SignedUrlUploadParamsSchema>;
