import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { MESSAGES } from '../constants/service.messages';
import type { IServiceService } from '../service/IServiceService';
import type { ServicePaginationQueryDto } from '../dto/service.request.dto';

@injectable()
export class ServiceController {
  constructor(@inject(TOKENS.ServiceService) private readonly _service: IServiceService) {}

  async create(req: Request, res: Response) {
    const data = await this._service.create(req.body);
    res.status(HttpStatus.CREATED).json(new ApiResponse(true, MESSAGES.SERVICE.CREATED, data));
  }

  async update(req: Request, res: Response) {
    const data = await this._service.update(req.params.id, req.body);
    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.SERVICE.UPDATED, data));
  }

  async listAdmin(req: Request, res: Response) {
    const includeDeleted = req.query.includeDeleted === 'true';
    const data = await this._service.list(includeDeleted);
    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.SERVICE.LISTED, data));
  }

  async listPublic(_req: Request, res: Response) {
    const data = await this._service.list(false);
    const activeOnly = data.filter((s) => !s.isDeleted && s.status === 'ACTIVE');

    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.SERVICE.LISTED, activeOnly));
  }

  async softDelete(req: Request, res: Response) {
    const data = await this._service.softDelete({ id: req.params.id });
    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.SERVICE.DELETED, data));
  }

  async restore(req: Request, res: Response) {
    const data = await this._service.restore({ id: req.params.id });
    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.SERVICE.RESTORED, data));
  }

  async uploadImage(req: Request, res: Response) {
    const data = await this._service.uploadServiceImage(req.params.id, req.file!);
    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.SERVICE.IMAGE_UPLOADED, data));
  }

  async deleteImage(req: Request, res: Response) {
    const data = await this._service.deleteServiceImage(req.params.id);
    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.SERVICE.IMAGE_DELETED, data));
  }

  async getPaginatedServices(req: Request, res: Response) {
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

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, 'Services retrieved successfully', result));
  }
}
