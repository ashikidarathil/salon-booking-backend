export type ServiceUpdatePayload = {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  imageUrl?: string;
  categoryId?: string;
  whatIncluded?: string[];
};
