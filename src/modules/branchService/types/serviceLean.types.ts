export type ServiceLean = {
  _id: unknown;
  name: string;
  categoryId?: {
    _id: unknown;
    name: string;
  };
  imageUrl?: string;
  description?: string;
  whatIncluded?: string[];
  isDeleted?: boolean;
};
