import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { injectable } from 'tsyringe';
import { env } from '../../../config/env';
import { IImageService, UploadImageParams, UploadAudioParams } from './IImageService';

type ResourceType = 'image' | 'video' | 'raw';

@injectable()
export class CloudinaryService implements IImageService {
  private rootFolder: string;

  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    this.rootFolder = env.CLOUDINARY_FOLDER;
  }

  private upload(
    buffer: Buffer,
    folder: string,
    resourceType: ResourceType,
    context: Record<string, string>,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${this.rootFolder}/${folder}`,
          public_id: uuidv4(),
          resource_type: resourceType,
          context,
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(error ?? new Error('Cloudinary upload failed'));
          }
          resolve(result.secure_url);
        },
      );
      stream.end(buffer);
    });
  }

  // URLs look like https://res.cloudinary.com/<cloud>/<type>/upload/v123/<folder>/<id>.<ext>
  private async deleteByUrl(url: string): Promise<void> {
    const match = url.match(
      /^https?:\/\/res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.[^./]+)?$/,
    );

    // Skip anything not hosted on Cloudinary (old S3 links, Google avatars, etc.)
    if (!match) return;

    const [, resourceType, publicId] = match;
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType as ResourceType });
  }

  async uploadProfilePicture(params: UploadImageParams): Promise<string> {
    const { file, userId, role } = params;

    const optimizedBuffer = await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80 })
      .toBuffer();

    return this.upload(optimizedBuffer, `profiles/${role}/${userId}`, 'image', { userId, role });
  }

  async deleteProfilePicture(pictureUrl: string): Promise<void> {
    await this.deleteByUrl(pictureUrl);
  }

  async uploadServiceImage(params: UploadImageParams & { serviceId: string }): Promise<string> {
    const { file, serviceId } = params;

    const optimizedBuffer = await sharp(file.buffer)
      .resize(800, 600, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })
      .toBuffer();

    return this.upload(optimizedBuffer, `services/${serviceId}`, 'image', { serviceId });
  }

  async deleteServiceImage(imageUrl: string): Promise<void> {
    await this.deleteByUrl(imageUrl);
  }

  // Cloudinary stores audio under the "video" resource type
  async uploadAudio(params: UploadAudioParams): Promise<string> {
    const { file, roomId, senderId } = params;
    return this.upload(file.buffer, `chat/audio/${roomId}/${senderId}`, 'video', {
      roomId,
      senderId,
    });
  }

  async uploadChatImage(params: UploadAudioParams): Promise<string> {
    const { file, roomId, senderId } = params;
    return this.upload(file.buffer, `chat/images/${roomId}/${senderId}`, 'image', {
      roomId,
      senderId,
    });
  }

  async deleteAudio(audioUrl: string): Promise<void> {
    await this.deleteByUrl(audioUrl);
  }
}
