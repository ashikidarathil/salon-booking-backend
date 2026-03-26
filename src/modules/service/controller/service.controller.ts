import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { MESSAGES } from '../constants/service.messages';
import type { IServiceService } from '../service/IServiceService';
import type {
  ServicePaginationQueryDto,
  CreateServiceDto,
  UpdateServiceDto,
  SoftDeleteServiceDto,
  RestoreServiceDto,
} from '../dto/service.request.dto';

@injectable()
export class ServiceController {
  constructor(@inject(TOKENS.ServiceService) private readonly _service: IServiceService) {}

  async create(req: Request, res: Response): Promise<Response> {
    const dto: CreateServiceDto = {
      name: req.body.name,
      description: req.body.description,
      categoryId: req.body.categoryId,
      imageUrl: req.body.imageUrl,
      whatIncluded: req.body.whatIncluded,
    };

    const data = await this._service.create(dto);
    return ApiResponse.success(res, data, MESSAGES.SERVICE.CREATED, HttpStatus.CREATED);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const dto: UpdateServiceDto = {
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
      imageUrl: req.body.imageUrl,
      categoryId: req.body.categoryId,
      whatIncluded: req.body.whatIncluded,
    };

    const data = await this._service.update(req.params.id, dto);
    return ApiResponse.success(res, data, MESSAGES.SERVICE.UPDATED);
  }

  async listAdmin(req: Request, res: Response): Promise<Response> {
    const includeDeleted = req.query.includeDeleted === 'true';
    const data = await this._service.list(includeDeleted);
    return ApiResponse.success(res, data, MESSAGES.SERVICE.LISTED);
  }

  async listPublic(_req: Request, res: Response): Promise<Response> {
    const data = await this._service.list(false);
    const activeOnly = data.filter((s) => !s.isDeleted && s.status === 'ACTIVE');
    return ApiResponse.success(res, activeOnly, MESSAGES.SERVICE.LISTED);
  }

  async softDelete(req: Request, res: Response): Promise<Response> {
    const dto: SoftDeleteServiceDto = {
      id: req.params.id,
    };

    const data = await this._service.softDelete(dto);
    return ApiResponse.success(res, data, MESSAGES.SERVICE.DELETED);
  }

  async restore(req: Request, res: Response): Promise<Response> {
    const dto: RestoreServiceDto = {
      id: req.params.id,
    };

    const data = await this._service.restore(dto);
    return ApiResponse.success(res, data, MESSAGES.SERVICE.RESTORED);
  }

  async uploadImage(req: Request, res: Response): Promise<Response> {
    const data = await this._service.uploadServiceImage(req.params.id, req.file!);
    return ApiResponse.success(res, data, MESSAGES.SERVICE.IMAGE_UPLOADED);
  }

  async deleteImage(req: Request, res: Response): Promise<Response> {
    const data = await this._service.deleteServiceImage(req.params.id);
    return ApiResponse.success(res, data, MESSAGES.SERVICE.IMAGE_DELETED);
  }

  async getPaginatedServices(req: Request, res: Response): Promise<Response> {
    const query: ServicePaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'desc',
      categoryId: typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined,
      status:
        req.query.status === 'ACTIVE' || req.query.status === 'INACTIVE'
          ? (req.query.status as 'ACTIVE' | 'INACTIVE')
          : undefined,
      ...(typeof req.query.isDeleted === 'string' && {
        isDeleted: req.query.isDeleted === 'true',
      }),
    };

    const result = await this._service.getPaginatedServices(query);
    return ApiResponse.success(res, result, MESSAGES.SERVICE.RETRIEVED_SUCCESSFULLY);
  }

  async getPublic(req: Request, res: Response): Promise<Response> {
    const data = await this._service.list(false);
    const service = data.find(
      (s) => s.id === req.params.id && !s.isDeleted && s.status === 'ACTIVE',
    );

    if (!service) {
      throw new AppError(MESSAGES.SERVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return ApiResponse.success(res, service, MESSAGES.SERVICE.RETRIEVED_SUCCESSFULLY);
  }

  async listPublicPaginated(req: Request, res: Response): Promise<Response> {
    const query: ServicePaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'desc',
      categoryId: typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined,
      status: 'ACTIVE',
      isDeleted: false,
    };

    const result = await this._service.getPaginatedServices(query);
    return ApiResponse.success(res, result, MESSAGES.SERVICE.RETRIEVED_SUCCESSFULLY);
  }
}
