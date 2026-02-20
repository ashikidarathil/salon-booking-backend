import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { STYLIST_SERVICE_MESSAGES } from '../constants/stylistService.messages';
import type { IStylistServiceService } from './IStylistServiceService';
import type { IStylistServiceRepository } from '../repository/IStylistServiceRepository';
import { ToggleStylistServiceStatusRequestDto } from '../dto/stylistService.request.dto';
import { StylistServiceMapper, StylistServiceItemResponse } from '../mapper/stylistService.mapper';
import { ServiceModel, ServiceLean } from '../../../models/service.model';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginationQueryParser } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { PaginationResponseBuilder } from '../../../common/dto/pagination.response.dto';

@injectable()
export class StylistServiceService implements IStylistServiceService {
  constructor(
    @inject(TOKENS.StylistServiceMappingRepository)
    private readonly _repo: IStylistServiceRepository,
  ) {}

  async list(stylistId: string): Promise<StylistServiceItemResponse[]> {
    if (!stylistId) {
      throw new AppError(STYLIST_SERVICE_MESSAGES.STYLIST_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const services = await ServiceModel.find()
      .select('name categoryId isDeleted createdAt')
      .populate({
        path: 'categoryId',
        select: 'name',
      })
      .lean<ServiceLean[]>();

    const mappings = await this._repo.findByStylistId(stylistId);
    const map = new Map<string, (typeof mappings)[0]>();
    for (const m of mappings) map.set(m.serviceId.toString(), m);

    return services
      .filter((s) => !s.isDeleted)
      .map((s) => {
        const m = map.get(String(s._id));
        return StylistServiceMapper.toItem({
          stylistId,
          serviceId: String(s._id),
          name: s.name,
          categoryId: s.categoryId ? String(s.categoryId._id) : undefined,
          categoryName: s.categoryId?.name,
          isActive: m ? m.isActive : false,
          configured: Boolean(m),
          createdAt: s.createdAt,
        });
      });
  }

  async toggleStatus(
    stylistId: string,
    serviceId: string,
    dto: ToggleStylistServiceStatusRequestDto,
    adminId: string,
  ) {
    if (!stylistId) {
      throw new AppError(STYLIST_SERVICE_MESSAGES.STYLIST_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    if (!serviceId) {
      throw new AppError(STYLIST_SERVICE_MESSAGES.SERVICE_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const doc = await this._repo.toggleStatus(stylistId, serviceId, dto.isActive, adminId);
    return StylistServiceMapper.toStatus(doc);
  }

  async listPaginated(
    stylistId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<StylistServiceItemResponse>> {
    if (!stylistId) {
      throw new AppError(STYLIST_SERVICE_MESSAGES.STYLIST_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const { params, search, sort } = PaginationQueryParser.parse(query);

    const services = await ServiceModel.find()
      .select('name categoryId isDeleted createdAt')
      .populate({
        path: 'categoryId',
        select: 'name',
      })
      .lean<ServiceLean[]>();

    const mappings = await this._repo.findByStylistId(stylistId);
    const map = new Map<string, (typeof mappings)[0]>();
    for (const m of mappings) map.set(m.serviceId.toString(), m);

    let items = services
      .filter((s) => !s.isDeleted)
      .map((s) => {
        const m = map.get(String(s._id));
        return StylistServiceMapper.toItem({
          stylistId,
          serviceId: String(s._id),
          name: s.name,
          categoryId: s.categoryId ? String(s.categoryId._id) : undefined,
          categoryName: s.categoryId?.name,
          isActive: m ? m.isActive : false,
          configured: Boolean(m),
          createdAt: s.createdAt,
        });
      });

    if (search) {
      const regex = new RegExp(search, 'i');
      items = items.filter(
        (item) => regex.test(item.name) || (item.categoryName && regex.test(item.categoryName)),
      );
    }

    const filterConfigured = query.configured;
    if (filterConfigured !== undefined) {
      const isConfigured = String(filterConfigured) === 'true';
      items = items.filter((item) => item.configured === isConfigured);
    }

    const filterActive = query.isActive;
    if (filterActive !== undefined) {
      const isActive = String(filterActive) === 'true';
      items = items.filter((item) => item.isActive === isActive);
    }

    // Default sort by createdAt desc if not provided
    const sortField = sort && Object.keys(sort).length > 0 ? Object.keys(sort)[0] : 'createdAt';
    const sortOrder = sort && Object.keys(sort).length > 0 ? (sort[sortField] as number) : -1;

    items.sort((a: any, b: any) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 1 ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (valA === undefined || valA === null) return sortOrder === 1 ? 1 : -1;
      if (valB === undefined || valB === null) return sortOrder === 1 ? -1 : 1;
      if (valA < valB) return sortOrder === 1 ? -1 : 1;
      if (valA > valB) return sortOrder === 1 ? 1 : -1;
      return 0;
    });

    const totalItems = items.length;
    const paginatedItems = items.slice(params.skip, params.skip + params.limit);

    return PaginationResponseBuilder.build(paginatedItems, totalItems, params.page, params.limit);
  }
}
