import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { STYLIST_SERVICE_MESSAGES } from '../constants/stylistService.messages';
import type { IStylistServiceService } from './IStylistServiceService';
import type { IStylistServiceRepository } from '../repository/IStylistServiceRepository';
import {
  ToggleStylistServiceStatusRequestDto,
  StylistServiceItemResponseDto,
  StylistByServiceResponseDto,
} from '../dto/stylistService.dto';
import { StylistServiceMapper } from '../mapper/stylistService.mapper';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginationQueryParser } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { PaginationResponseBuilder } from '../../../common/dto/pagination.response.dto';
import { toObjectId, isValidObjectId } from '../../../common/utils/mongoose.util';
import type { IServiceRepository } from '../../service/repository/IServiceRepository';
import { BranchServiceModel } from '../../../models/branchService.model';
import { StylistModel } from '../../../models/stylist.model';

@injectable()
export class StylistServiceService implements IStylistServiceService {
  constructor(
    @inject(TOKENS.StylistServiceRepository)
    private readonly _repo: IStylistServiceRepository,
    @inject(TOKENS.ServiceRepository)
    private readonly _serviceRepo: IServiceRepository,
  ) {}

  private async getMappedServices(
    rawStylistId: string,
    branchId?: string,
  ): Promise<StylistServiceItemResponseDto[]> {
    let stylistId = rawStylistId;
    if (isValidObjectId(rawStylistId)) {
      const byUserId = await StylistModel.findOne({ userId: toObjectId(rawStylistId) })
        .select('_id')
        .lean();
      if (byUserId) {
        stylistId = byUserId._id.toString();
      }
    }

    const services = await this._serviceRepo.listAll();

    const mappings = await this._repo.findByStylistId(stylistId);
    const map = new Map<string, (typeof mappings)[0]>();
    for (const m of mappings) map.set(m.serviceId.toString(), m);

    // Load branch pricing if branchId is provided
    const branchPriceMap = new Map<string, { price: number; duration: number }>();
    if (branchId) {
      const branchServices = await BranchServiceModel.find({
        branchId: toObjectId(branchId),
        isActive: true,
      }).lean();
      for (const bs of branchServices) {
        branchPriceMap.set(bs.serviceId.toString(), { price: bs.price, duration: bs.duration });
      }
    }

    return services.map((s) => {
      const category = s.categoryId as unknown as { _id: string | object; name: string };
      const m = map.get(String(s._id));
      const pricing = branchPriceMap.get(String(s._id));
      return StylistServiceMapper.toItem({
        stylistId,
        serviceId: String(s._id),
        name: s.name,
        categoryId: category ? String(category._id) : undefined,
        categoryName: category?.name,
        isActive: m ? m.isActive : false,
        configured: Boolean(m),
        price: pricing?.price,
        duration: pricing?.duration,
        createdAt: s.createdAt,
      });
    });
  }

  async list(stylistId: string, branchId?: string): Promise<StylistServiceItemResponseDto[]> {
    if (!stylistId) {
      throw new AppError(STYLIST_SERVICE_MESSAGES.STYLIST_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    return this.getMappedServices(stylistId, branchId);
  }

  async toggleStatus(
    stylistId: string,
    serviceId: string,
    dto: ToggleStylistServiceStatusRequestDto,
    adminId: string,
  ) {
    if (!stylistId)
      throw new AppError(STYLIST_SERVICE_MESSAGES.STYLIST_REQUIRED, HttpStatus.BAD_REQUEST);
    if (!serviceId)
      throw new AppError(STYLIST_SERVICE_MESSAGES.SERVICE_REQUIRED, HttpStatus.BAD_REQUEST);

    const doc = await this._repo.toggleStatus(stylistId, serviceId, dto.isActive, adminId);
    if (!doc) throw new AppError(STYLIST_SERVICE_MESSAGES.SERVICE_NOT_FOUND, HttpStatus.NOT_FOUND);

    return StylistServiceMapper.toStatus(doc);
  }

  async listPaginated(
    stylistId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<StylistServiceItemResponseDto>> {
    if (!stylistId) {
      throw new AppError(STYLIST_SERVICE_MESSAGES.STYLIST_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const { params, search, sort } = PaginationQueryParser.parse(query);
    let items = await this.getMappedServices(stylistId);

    if (search) {
      const regex = new RegExp(search, 'i');
      items = items.filter(
        (item) => regex.test(item.name) || (item.categoryName && regex.test(item.categoryName)),
      );
    }

    if (query.configured !== undefined) {
      const isConfigured = String(query.configured) === 'true';
      items = items.filter((item) => item.configured === isConfigured);
    }

    if (query.isActive !== undefined) {
      const isActive = String(query.isActive) === 'true';
      items = items.filter((item) => item.isActive === isActive);
    }

    // Default sort by createdAt desc if not provided
    const sortField = (
      sort && Object.keys(sort).length > 0 ? Object.keys(sort)[0] : 'createdAt'
    ) as keyof StylistServiceItemResponseDto;
    const sortOrder =
      sort && Object.keys(sort).length > 0 ? (sort[sortField as string] as number) : -1;

    items.sort((a, b) => {
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

  async getStylistsByService(serviceId: string): Promise<StylistByServiceResponseDto[]> {
    if (!serviceId) {
      throw new AppError(STYLIST_SERVICE_MESSAGES.SERVICE_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    const mappings = await this._repo.findByServiceId(serviceId);
    return mappings.map(StylistServiceMapper.toStylist);
  }
}
