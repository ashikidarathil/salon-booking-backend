// backend/src/common/service/s3/S3Service.ts

import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { injectable } from 'tsyringe';
import { env } from '../../../config/env';

export interface UploadProfilePictureParams {
  file: Express.Multer.File;
  userId: string;
  role: string;
}

@injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION, // e.g. ap-southeast-2
    });

    this.bucketName = env.AWS_S3_BUCKET_NAME!;
  }

  async uploadProfilePicture(params: UploadProfilePictureParams): Promise<string> {
    const { file, userId, role } = params;

    const optimizedBuffer = await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const key = `profiles/${role}/${userId}/${uuidv4()}.jpg`;

    const result = await this.s3
      .upload({
        Bucket: this.bucketName,
        Key: key,
        Body: optimizedBuffer,
        ContentType: 'image/jpeg',
        Metadata: {
          userId,
          role,
          uploadDate: new Date().toISOString(),
        },
      })
      .promise();

    return result.Location;
  }

  async deleteProfilePicture(pictureUrl: string): Promise<void> {
    const key = new URL(pictureUrl).pathname.substring(1);

    await this.s3
      .deleteObject({
        Bucket: this.bucketName,
        Key: key,
      })
      .promise();
  }
}
