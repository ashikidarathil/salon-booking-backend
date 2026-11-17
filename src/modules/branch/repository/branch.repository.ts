import { BranchModel } from '../../../models/branch.model';
import { BranchServiceModel } from '../../../models/branchService.model';
import { BranchCategoryModel } from '../../../models/branchCategory.model';
import { ServiceModel } from '../../../models/service.model';
import type { IBranchRepository } from './IBranchRepository';
import type { CreateBranchDto, UpdateBranchDto } from '../dto/branch.request.dto';
import { PaginationQueryParser } from '../../../common/dto/pagination.query.dto';
import { PaginationResponseBuilder } from '../../../common/dto/pagination.response.dto';
import type { MongoFilter } from '../../../common/types/mongoFilter';
import { BranchMapper } from '../mapper/branch.mapper';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import type { BranchResponseDto } from '../dto/branch.response.dto';
import { BranchWithDistanceDto } from '../dto/branch.response.dto';

export class BranchRepository implements IBranchRepository {
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  create(data: CreateBranchDto) {
    return BranchModel.create({
      ...data,
      isDeleted: false,
    });
  }
  findAll(includeDeleted = false) {
    if (includeDeleted) {
      return BranchModel.find().sort({ createdAt: -1 });
    }

    return BranchModel.find({
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).sort({ createdAt: -1 });
  }
  findById(id: string) {
    return BranchModel.findById(id);
  }

  update(id: string, data: UpdateBranchDto) {
    return BranchModel.findByIdAndUpdate(id, data, { new: true });
  }

  disable(id: string) {
    return BranchModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }

  restore(id: string) {
    return BranchModel.findByIdAndUpdate(id, { isDeleted: false }, { new: true });
  }

  async getPaginatedBranches(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BranchResponseDto>> {
    const { params, search, sort, filters } = PaginationQueryParser.parse(query);

    const finalQuery: MongoFilter = {};

    if (typeof filters.isDeleted === 'boolean') {
      finalQuery.isDeleted = filters.isDeleted;
    }

    if (search) {
      const regex = new RegExp(search, 'i');

      finalQuery.$or = [{ name: regex }, { address: regex }, { phone: regex }];
    }

    const [branches, totalItems] = await Promise.all([
      BranchModel.find(finalQuery).sort(sort).skip(params.skip).limit(params.limit).lean(),
      BranchModel.countDocuments(finalQuery),
    ]);

    if (branches.length === 0) {
      return PaginationResponseBuilder.build([], totalItems, params.page, params.limit);
    }

    const result = branches.map((branch) => BranchMapper.toResponse(branch));

    return PaginationResponseBuilder.build(result, totalItems, params.page, params.limit);
  }

  async findNearestBranches(
    latitude: number,
    longitude: number,
    maxDistance = 5000000,
  ): Promise<BranchWithDistanceDto[]> {
    if (latitude < -90 || latitude > 90) {
      throw new Error('Invalid latitude');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude');
    }

    const branches = await BranchModel.find({
      isDeleted: false,
    }).lean();

    const branchesWithDistance = branches
      .map((branch) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          branch.latitude,
          branch.longitude,
        );

        if (distance > maxDistance) {
          return null;
        }

        return {
          ...BranchMapper.toResponse(branch, distance),
          distance,
        };
      })
      .filter((branch) => branch !== null);

    // Branches that offer at least one active service come first, then by distance
    const branchIdsWithServices = await this.findBranchIdsWithVisibleServices();
    const hasServices = (id: string) => (branchIdsWithServices.has(id) ? 0 : 1);

    branchesWithDistance.sort(
      (a, b) => hasServices(a.id) - hasServices(b.id) || (a.distance || 0) - (b.distance || 0),
    );

    return branchesWithDistance;
  }

  // Same visibility rule as the public branch services list: service active + not deleted,
  // its category active + not deleted, branch mapping active, and category enabled for the branch.
  private async findBranchIdsWithVisibleServices(): Promise<Set<string>> {
    const services = await ServiceModel.find({ status: 'ACTIVE', isDeleted: false })
      .select('_id categoryId')
      .populate({ path: 'categoryId', select: 'status isDeleted' })
      .lean<
        {
          _id: unknown;
          categoryId?: { _id: unknown; status: string; isDeleted: boolean } | null;
        }[]
      >();

    const serviceCategory = new Map<string, string | null>();
    for (const s of services) {
      const category = s.categoryId;
      if (category && (category.status !== 'ACTIVE' || category.isDeleted)) continue;
      serviceCategory.set(String(s._id), category ? String(category._id) : null);
    }

    const [mappings, branchCategories] = await Promise.all([
      BranchServiceModel.find({ isActive: true, serviceId: { $in: [...serviceCategory.keys()] } })
        .select('branchId serviceId')
        .lean<{ branchId: unknown; serviceId: unknown }[]>(),
      BranchCategoryModel.find({ isActive: true })
        .select('branchId categoryId')
        .lean<{ branchId: unknown; categoryId: unknown }[]>(),
    ]);

    const enabledBranchCategories = new Set(
      branchCategories.map((bc) => `${String(bc.branchId)}:${String(bc.categoryId)}`),
    );

    const branchIds = new Set<string>();
    for (const m of mappings) {
      const branchId = String(m.branchId);
      const categoryId = serviceCategory.get(String(m.serviceId));
      if (categoryId === null || enabledBranchCategories.has(`${branchId}:${categoryId}`)) {
        branchIds.add(branchId);
      }
    }
    return branchIds;
  }
}
