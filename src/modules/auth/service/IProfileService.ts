export interface IProfileService {
  uploadPicture(userId: string, file: Express.Multer.File): Promise<{ profilePicture: string }>;
}
