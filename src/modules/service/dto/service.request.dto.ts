import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

export interface CreateServiceDto {
  name: string;
  description?: string;
  categoryId: string;
  imageUrl?: string;
  whatIncluded?: string[];
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  imageUrl?: string;
  categoryId?: string;
  whatIncluded?: string[];
}

export interface SoftDeleteServiceDto {
  id: string;
}

export interface RestoreServiceDto {
  id: string;
}

export interface ServicePaginationQueryDto extends PaginationQueryDto {
  categoryId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
