export interface UploadImageParams {
  file: Express.Multer.File;
  userId: string;
  role: string;
}

export interface IImageService {
  uploadProfilePicture(params: UploadImageParams): Promise<string>;
  deleteProfilePicture(pictureUrl: string): Promise<void>;
  uploadServiceImage(params: UploadImageParams & { serviceId: string }): Promise<string>;
  deleteServiceImage(imageUrl: string): Promise<void>;
}
