import type {
  CreateServiceDto,
  UpdateServiceDto,
  SoftDeleteServiceDto,
  RestoreServiceDto,
  ServicePaginationQueryDto,
} from '../dto/service.request.dto';
import type { ServiceResponseDto, ServicePaginatedResponse } from '../dto/service.response.dto';

export interface IServiceService {
  create(dto: CreateServiceDto): Promise<ServiceResponseDto>;
  update(id: string, dto: UpdateServiceDto): Promise<ServiceResponseDto>;
  list(includeDeleted?: boolean): Promise<ServiceResponseDto[]>;
  softDelete(dto: SoftDeleteServiceDto): Promise<ServiceResponseDto>;
  restore(dto: RestoreServiceDto): Promise<ServiceResponseDto>;
  uploadServiceImage(serviceId: string, file: Express.Multer.File): Promise<ServiceResponseDto>;
  deleteServiceImage(serviceId: string): Promise<ServiceResponseDto>;
  getPaginatedServices(query: ServicePaginationQueryDto): Promise<ServicePaginatedResponse>;
}
