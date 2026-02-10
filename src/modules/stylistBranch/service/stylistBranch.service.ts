import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';

import { STYLIST_BRANCH_MESSAGES } from '../constants/stylistBranch.messages';
import type { IStylistBranchService } from './IStylistBranchService';
import type { IStylistBranchRepository } from '../repository/IStylistBranchRepository';

import type {
  AssignStylistToBranchRequestDto,
  UnassignStylistFromBranchRequestDto,
  ChangeStylistBranchRequestDto,
} from '../dto/stylistBranch.request.dto';

import { StylistBranchMapper } from '../mapper/stylistBranch.mapper';

import { StylistModel } from '../../../models/stylist.model';
import { UserModel } from '../../../models/user.model';
import { StylistBranchModel } from '../../../models/stylistBranch.model';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginationQueryParser } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import type {
  BranchStylistItemDto,
  UnassignedStylistOptionDto,
} from '../dto/stylistBranch.response.dto';
import { PaginationResponseBuilder } from '../../../common/dto/pagination.response.dto';

@injectable()
export class StylistBranchService implements IStylistBranchService {
  constructor(
    @inject(TOKENS.StylistBranchRepository)
    private readonly repo: IStylistBranchRepository,
  ) {}

  async listBranchStylists(branchId: string) {
    const mappings = await StylistBranchModel.find({
      branchId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (mappings.length === 0) return [];

    const stylistIds = mappings.map((m) => m.stylistId);

    const stylists = await StylistModel.find({
      _id: { $in: stylistIds },
    })
      .select('userId specialization experience status')
      .lean();

    const stylistMap = new Map<string, (typeof stylists)[0]>();
    stylists.forEach((s) => stylistMap.set(s._id.toString(), s));

    const userIds = stylists.map((s) => s.userId);

    const users = await UserModel.find({
      _id: { $in: userIds },
    })
      .select('name email phone')
      .lean();

    const userMap = new Map<string, (typeof users)[0]>();
    users.forEach((u) => userMap.set(u._id.toString(), u));

    return mappings.map((m) => {
      const stylist = stylistMap.get(m.stylistId.toString());
      if (!stylist) {
        throw new AppError(STYLIST_BRANCH_MESSAGES.STYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      const user = userMap.get(stylist.userId.toString());

      return StylistBranchMapper.toBranchStylistItem({
        mappingId: m._id.toString(),
        branchId: m.branchId.toString(),
        stylistId: stylist._id.toString(),
        userId: stylist.userId.toString(),
        name: user?.name ?? 'Stylist',
        email: user?.email,
        phone: user?.phone,
        specialization: stylist.specialization,
        experience: stylist.experience,
        stylistStatus: stylist.status,
        assignedAt: m.assignedAt,
      });
    });
  }

  async listUnassignedOptionsPaginated(
    _branchId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<UnassignedStylistOptionDto>> {
    const { params, search } = PaginationQueryParser.parse(query);

    const active = await StylistBranchModel.find({ isActive: true }).select('stylistId').lean();
    const assignedStylistIds = active.map((x) => x.stylistId);

    const stylists = await StylistModel.find({
      _id: { $nin: assignedStylistIds },
    })
      .select('userId specialization experience status')
      .sort({ createdAt: -1 })
      .lean();

    if (stylists.length === 0) {
      return PaginationResponseBuilder.build([], 0, params.page, params.limit);
    }

    const userIds = stylists.map((s) => s.userId);

    const users = await UserModel.find({ _id: { $in: userIds } })
      .select('name email phone')
      .lean();

    const userMap = new Map<string, (typeof users)[0]>();
    users.forEach((u) => userMap.set(u._id.toString(), u));

    let items: UnassignedStylistOptionDto[] = stylists.map((s) => {
      const user = userMap.get(s.userId.toString());
      return StylistBranchMapper.toUnassignedOption({
        stylistId: s._id.toString(),
        userId: s.userId.toString(),
        name: user?.name || 'Stylist',
        email: user?.email,
        phone: user?.phone,
        specialization: s.specialization,
        experience: s.experience,
        stylistStatus: s.status,
      });
    });

    if (search) {
      const regex = new RegExp(search, 'i');
      items = items.filter(
        (item) =>
          regex.test(item.name) || regex.test(item.email || '') || regex.test(item.specialization),
      );
    }

    const totalItems = items.length;

    const paginatedItems = items.slice(params.skip, params.skip + params.limit);

    return PaginationResponseBuilder.build(paginatedItems, totalItems, params.page, params.limit);
  }

  async listUnassignedOptions(_branchId: string) {
    const active = await StylistBranchModel.find({ isActive: true }).select('stylistId').lean();
    const assignedStylistIds = active.map((x) => x.stylistId);

    const stylists = await StylistModel.find({
      _id: { $nin: assignedStylistIds },
    })
      .select('userId specialization experience status')
      .sort({ createdAt: -1 })
      .lean();

    if (stylists.length === 0) return [];

    const userIds = stylists.map((s) => s.userId);

    const users = await UserModel.find({ _id: { $in: userIds } })
      .select('name email phone')
      .lean();

    const userMap = new Map<string, (typeof users)[0]>();
    users.forEach((u) => userMap.set(u._id.toString(), u));

    return stylists.map((s) => {
      const user = userMap.get(s.userId.toString());
      return StylistBranchMapper.toUnassignedOption({
        stylistId: s._id.toString(),
        userId: s.userId.toString(),
        name: user?.name || 'Stylist',
        email: user?.email,
        phone: user?.phone,
        specialization: s.specialization,
        experience: s.experience,
        stylistStatus: s.status,
      });
    });
  }

  async assign(branchId: string, dto: AssignStylistToBranchRequestDto, adminId: string) {
    const stylist = await StylistModel.findById(dto.stylistId)
      .select('_id userId specialization experience status')
      .lean();
    if (!stylist)
      throw new AppError(STYLIST_BRANCH_MESSAGES.STYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);

    const existing = await this.repo.findActiveByStylistId(dto.stylistId);
    if (existing) {
      throw new AppError(STYLIST_BRANCH_MESSAGES.STYLIST_ALREADY_ASSIGNED, HttpStatus.BAD_REQUEST);
    }

    const mapping = await this.repo.createAssignment(dto.stylistId, branchId, adminId);

    const user = await UserModel.findById(stylist.userId).select('name email phone').lean();

    return StylistBranchMapper.toBranchStylistItem({
      mappingId: mapping._id.toString(),
      branchId: mapping.branchId.toString(),
      stylistId: stylist._id.toString(),
      userId: stylist.userId.toString(),
      name: user?.name || 'Stylist',
      email: user?.email,
      phone: user?.phone,
      specialization: stylist.specialization,
      experience: stylist.experience,
      stylistStatus: stylist.status,
      assignedAt: mapping.assignedAt,
    });
  }

  async unassign(branchId: string, dto: UnassignStylistFromBranchRequestDto) {
    const updated = await this.repo.deactivateAssignment(dto.stylistId, branchId);
    if (!updated) throw new AppError(STYLIST_BRANCH_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    return { success: true as const };
  }

  async changeBranch(branchId: string, dto: ChangeStylistBranchRequestDto, adminId: string) {
    const stylist = await StylistModel.findById(dto.stylistId)
      .select('_id userId specialization experience status')
      .lean();
    if (!stylist)
      throw new AppError(STYLIST_BRANCH_MESSAGES.STYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);

    await this.repo.deactivateAnyActiveAssignment(dto.stylistId);

    const mapping = await this.repo.createAssignment(dto.stylistId, branchId, adminId);

    const user = await UserModel.findById(stylist.userId).select('name email phone').lean();

    return StylistBranchMapper.toBranchStylistItem({
      mappingId: mapping._id.toString(),
      branchId: mapping.branchId.toString(),
      stylistId: stylist._id.toString(),
      userId: stylist.userId.toString(),
      name: user?.name || 'Stylist',
      email: user?.email,
      phone: user?.phone,
      specialization: stylist.specialization,
      experience: stylist.experience,
      stylistStatus: stylist.status,
      assignedAt: mapping.assignedAt,
    });
  }

  async listBranchStylistsPaginated(
    branchId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BranchStylistItemDto>> {
    const { params, search } = PaginationQueryParser.parse(query);

    const mappings = await StylistBranchModel.find({
      branchId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (mappings.length === 0) {
      return PaginationResponseBuilder.build([], 0, params.page, params.limit);
    }

    const stylistIds = mappings.map((m) => m.stylistId);

    const stylists = await StylistModel.find({
      _id: { $in: stylistIds },
    })
      .select('userId specialization experience status')
      .lean();

    const stylistMap = new Map<string, (typeof stylists)[0]>();
    stylists.forEach((s) => stylistMap.set(s._id.toString(), s));

    const userIds = stylists.map((s) => s.userId);

    const users = await UserModel.find({
      _id: { $in: userIds },
    })
      .select('name email phone')
      .lean();

    const userMap = new Map<string, (typeof users)[0]>();
    users.forEach((u) => userMap.set(u._id.toString(), u));

    let items: BranchStylistItemDto[] = mappings.map((m) => {
      const stylist = stylistMap.get(m.stylistId.toString());
      if (!stylist) {
        throw new AppError(STYLIST_BRANCH_MESSAGES.STYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      const user = userMap.get(stylist.userId.toString());

      return StylistBranchMapper.toBranchStylistItem({
        mappingId: m._id.toString(),
        branchId: m.branchId.toString(),
        stylistId: stylist._id.toString(),
        userId: stylist.userId.toString(),
        name: user?.name ?? 'Stylist',
        email: user?.email,
        phone: user?.phone,
        specialization: stylist.specialization,
        experience: stylist.experience,
        stylistStatus: stylist.status,
        assignedAt: m.assignedAt,
      });
    });

    if (search) {
      const regex = new RegExp(search, 'i');
      items = items.filter(
        (item) =>
          regex.test(item.name) || regex.test(item.email || '') || regex.test(item.specialization),
      );
    }

    const totalItems = items.length;

    const paginatedItems = items.slice(params.skip, params.skip + params.limit);

    return PaginationResponseBuilder.build(paginatedItems, totalItems, params.page, params.limit);
  }
}
