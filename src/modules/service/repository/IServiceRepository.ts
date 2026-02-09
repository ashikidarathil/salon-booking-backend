import type { ServiceDocument } from '../../../models/service.model';
import type { ServicePaginationQueryDto } from '../dto/service.request.dto';
import type { ServicePaginatedResponse } from '../dto/service.response.dto';

export interface IServiceRepository {
  create(data: {
    name: string;
    description?: string;
    categoryId: string;
    imageUrl?: string;
    whatIncluded?: string[];
  }): Promise<ServiceDocument>;

  findById(id: string): Promise<ServiceDocument | null>;

  findByNameAndCategory(name: string, categoryId: string): Promise<ServiceDocument | null>;

  listAll(includeDeleted?: boolean): Promise<ServiceDocument[]>;

  updateById(
    id: string,
    data: Partial<{
      name: string;
      description?: string;
      status: 'ACTIVE' | 'INACTIVE';
      imageUrl: string;
      whatIncluded?: string[];
    }>,
  ): Promise<ServiceDocument | null>;

  updateImageUrl(id: string, imageUrl: string): Promise<ServiceDocument | null>;

  softDelete(id: string): Promise<ServiceDocument | null>;
  restore(id: string): Promise<ServiceDocument | null>;
  getPaginatedServices(query: ServicePaginationQueryDto): Promise<ServicePaginatedResponse>;
}
