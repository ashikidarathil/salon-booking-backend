import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';

import { BRANCH_SERVICE_MESSAGES } from '../constants/branchService.messages';
import type { IBranchServiceService } from './IBranchServiceService';
import type { IBranchServiceRepository } from '../repository/IBranchServiceRepository';

import type {
  UpsertBranchServiceRequestDto,
  ToggleBranchServiceStatusRequestDto,
} from '../dto/branchService.request.dto';
import { BranchServiceMapper } from '../mapper/branchService.mapper';

import { ServiceModel } from '../../../models/service.model';
import { ServiceLean } from '../types/serviceLean.types';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginationQueryParser } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import type { BranchServiceItemResponse } from '../mapper/branchService.mapper';
import { PaginationResponseBuilder } from '../../../common/dto/pagination.response.dto';

@injectable()
export class BranchServiceService implements IBranchServiceService {
  constructor(
    @inject(TOKENS.BranchServiceRepository)
    private readonly _repo: IBranchServiceRepository,
  ) {}

  async list(branchId: string) {
    if (!branchId) {
      throw new AppError(BRANCH_SERVICE_MESSAGES.BRANCH_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const services = await ServiceModel.find()
      .select('name categoryId isDeleted')
      .populate({
        path: 'categoryId',
        select: 'name',
      })
      .lean<ServiceLean[]>();

    const mappings = await this._repo.findByBranchId(branchId);

    const map = new Map<string, (typeof mappings)[0]>();
    for (const m of mappings) map.set(m.serviceId.toString(), m);

    return services
      .filter((s) => !s.isDeleted)
      .map((s) => {
        const m = map.get(String(s._id));
        return BranchServiceMapper.toItem({
          branchId,
          serviceId: String(s._id),
          name: s.name,
          categoryId: s.categoryId ? String(s.categoryId) : undefined,
          categoryName: s.categoryId?.name,
          price: m ? m.price : null,
          duration: m ? m.duration : null,
          isActive: m ? m.isActive : false,
          configured: Boolean(m),
        });
      });
  }

  async upsert(
    branchId: string,
    serviceId: string,
    dto: UpsertBranchServiceRequestDto,
    adminId: string,
  ) {
    if (!branchId) {
      throw new AppError(BRANCH_SERVICE_MESSAGES.BRANCH_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    if (!serviceId) {
      throw new AppError(BRANCH_SERVICE_MESSAGES.SERVICE_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const svc = (await ServiceModel.findById(serviceId)
      .select('name categoryId')
      .populate({ path: 'categoryId', select: 'name' })
      .lean()) as {
      name?: string;
      categoryId?: { _id: unknown; name: string };
    } | null;

    const doc = await this._repo.upsert(
      branchId,
      serviceId,
      {
        price: Number(dto.price),
        duration: Number(dto.duration),
        isActive: dto.isActive ?? true,
      },
      adminId,
    );

    return BranchServiceMapper.toItem({
      branchId: doc.branchId.toString(),
      serviceId: doc.serviceId.toString(),
      name: svc?.name ?? 'Service',
      categoryId: svc?.categoryId ? String(svc.categoryId) : undefined,
      categoryName: svc?.categoryId?.name,
      price: doc.price,
      duration: doc.duration,
      isActive: doc.isActive,
      configured: true,
    });
  }

  async toggleStatus(
    branchId: string,
    serviceId: string,
    dto: ToggleBranchServiceStatusRequestDto,
    adminId: string,
  ) {
    const doc = await this._repo.toggleStatus(branchId, serviceId, dto.isActive, adminId);
    return BranchServiceMapper.toStatus({
      branchId: doc.branchId.toString(),
      serviceId: doc.serviceId.toString(),
      isActive: doc.isActive,
    });
  }

  async listPaginated(
    branchId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BranchServiceItemResponse>> {
    if (!branchId) {
      throw new AppError(BRANCH_SERVICE_MESSAGES.BRANCH_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const { params, search } = PaginationQueryParser.parse(query);

    // ✅ POPULATE CATEGORY NAME
    const services = await ServiceModel.find()
      .select('name categoryId isDeleted')
      .populate({
        path: 'categoryId',
        select: 'name',
      })
      .lean<ServiceLean[]>();

    // Get branch-service mappings for this branch
    const mappings = await this._repo.findByBranchId(branchId);
    const map = new Map<string, (typeof mappings)[0]>();
    for (const m of mappings) map.set(m.serviceId.toString(), m);

    // Filter deleted and map to response format
    let items = services
      .filter((s) => !s.isDeleted)
      .map((s) => {
        const m = map.get(String(s._id));
        return BranchServiceMapper.toItem({
          branchId,
          serviceId: String(s._id),
          name: s.name,
          categoryId: s.categoryId ? String(s.categoryId) : undefined,
          categoryName: s.categoryId?.name, // ✅ INCLUDE CATEGORY NAME
          price: m ? m.price : null,
          duration: m ? m.duration : null,
          isActive: m ? m.isActive : false,
          configured: Boolean(m),
        });
      });

    // ✅ Apply search filter
    if (search) {
      const regex = new RegExp(search, 'i');
      items = items.filter(
        (item) => regex.test(item.name) || (item.categoryName && regex.test(item.categoryName)),
      );
    }

    // ✅ Apply configured filter if provided
    const filterConfigured = query.configured;
    if (filterConfigured !== undefined) {
      items = items.filter((item) => item.configured === filterConfigured);
    }

    // ✅ Apply active/inactive filter if provided
    const filterActive = query.isActive;
    if (filterActive !== undefined) {
      items = items.filter((item) => item.isActive === filterActive);
    }

    // Get total count before pagination
    const totalItems = items.length;

    // ✅ Apply pagination
    const paginatedItems = items.slice(params.skip, params.skip + params.limit);

    return PaginationResponseBuilder.build(paginatedItems, totalItems, params.page, params.limit);
  }

  async listPaginatedPublic(
    branchId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BranchServiceItemResponse>> {
    if (!branchId) {
      throw new AppError(BRANCH_SERVICE_MESSAGES.BRANCH_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const { params, search } = PaginationQueryParser.parse(query);

    const services = await ServiceModel.find({ status: 'ACTIVE', isDeleted: false })
      .select('name categoryId description imageUrl whatIncluded status')
      .populate({
        path: 'categoryId',
        select: 'name',
      })
      .lean<ServiceLean[]>();

    const mappings = await this._repo.findByBranchId(branchId);
    const map = new Map<string, (typeof mappings)[0]>();
    for (const m of mappings) {
      if (m.isActive) map.set(m.serviceId.toString(), m);
    }

    let items = services.map((s) => {
      const m = map.get(String(s._id));
      return BranchServiceMapper.toItem({
        branchId,
        serviceId: String(s._id),
        name: s.name,
        categoryId: s.categoryId ? String(s.categoryId) : undefined,
        categoryName: s.categoryId?.name,
        imageUrl: s.imageUrl,
        description: s.description,
        whatIncluded: s.whatIncluded,
        price: m ? m.price : null,
        duration: m ? m.duration : null,
        isActive: m ? m.isActive : false,
        configured: Boolean(m),
      });
    });

    // Filter only configured services (have price and duration)
    items = items.filter((item) => item.configured);

    if (search) {
      const regex = new RegExp(search, 'i');
      items = items.filter((item) => regex.test(item.name) || regex.test(item.categoryName || ''));
    }

    // Filter by category if provided
    const categoryId = query.categoryId;
    if (categoryId) {
      items = items.filter((item) => item.categoryId === categoryId);
    }

    const totalItems = items.length;
    const paginatedItems = items.slice(params.skip, params.skip + params.limit);

    return PaginationResponseBuilder.build(paginatedItems, totalItems, params.page, params.limit);
  }

  async getDetailsPublic(branchId: string, serviceId: string): Promise<BranchServiceItemResponse> {
    if (!branchId) {
      throw new AppError(BRANCH_SERVICE_MESSAGES.BRANCH_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    if (!serviceId) {
      throw new AppError(BRANCH_SERVICE_MESSAGES.SERVICE_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const service = (await ServiceModel.findById(serviceId)
      .select('name categoryId description imageUrl whatIncluded status isDeleted')
      .populate({ path: 'categoryId', select: 'name' })
      .lean()) as {
      _id: unknown;
      name?: string;
      description?: string;
      imageUrl?: string;
      whatIncluded?: string[];
      status?: string;
      isDeleted?: boolean;
      categoryId?: { _id: unknown; name: string };
    } | null;

    if (!service || service.isDeleted || service.status !== 'ACTIVE') {
      throw new AppError('Service not found', 404);
    }

    const mapping = await this._repo.findOne(branchId, serviceId);
    if (!mapping || !mapping.isActive) {
      throw new AppError('Service not available at this branch', 404);
    }

    return BranchServiceMapper.toItem({
      branchId,
      serviceId: String(service._id),
      name: service.name ?? 'Service',
      categoryId: service.categoryId ? String(service.categoryId._id) : undefined,
      categoryName: service.categoryId?.name,
      imageUrl: service.imageUrl,
      description: service.description,
      whatIncluded: service.whatIncluded,
      price: mapping.price,
      duration: mapping.duration,
      isActive: mapping.isActive,
      configured: true,
    });
  }
}
