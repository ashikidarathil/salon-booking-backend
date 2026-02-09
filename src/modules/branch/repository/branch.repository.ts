import { BranchModel } from '../../../models/branch.model';
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
    maxDistance = 50000,
  ): Promise<BranchWithDistanceDto[]> {
    console.log(`🗺️ Finding branches near: ${latitude}, ${longitude}`);

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

    branchesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    console.log(`✅ Found ${branchesWithDistance.length} nearby branches`);

    return branchesWithDistance;
  }
}
