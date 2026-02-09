export interface UploadProfilePictureDto {
  userId: string;
  file: Express.Multer.File;
}
