import { injectable } from 'tsyringe';
import { StylistModel, type StylistDocument } from '../../../models/stylist.model';
import { UserModel } from '../../../models/user.model';
import {
  StylistInviteModel,
  type StylistInviteDocument,
} from '../../../models/stylistInvite.model';
import { StylistBranchModel } from '../../../models/stylistBranch.model';
import { StylistServiceModel } from '../../../models/stylistService.model';
import { BranchServiceModel } from '../../../models/branchService.model';
import { BranchModel } from '../../../models/branch.model';
import { ServiceModel } from '../../../models/service.model';
import { CategoryModel } from '../../../models/category.model';
import { BranchCategoryModel } from '../../../models/branchCategory.model';
import { StylistWeeklyScheduleModel } from '../../../models/stylistWeeklySchedule.model';
import type {
  IStylistRepository,
  StylistListItem,
  IWeeklyScheduleItem,
} from './IStylistRepository';
import { CreateStylistInput } from '../type/CreateStylistInput';
import { StylistDraft } from './IStylistRepository';
import type { MongoFilter } from '../../../common/types/mongoFilter';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { PaginationQueryParser } from '../../../common/dto/pagination.query.dto';
import { PaginationResponseBuilder } from '../../../common/dto/pagination.response.dto';
import mongoose from 'mongoose';

interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  isBlocked: boolean;
  status: string;
  profilePicture?: string;
}

interface PopulatedBranch {
  _id: mongoose.Types.ObjectId;
  name: string;
}

interface PopulatedService {
  _id: mongoose.Types.ObjectId;
  name: string;
  imageUrl?: string;
  categoryId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; toString(): string };
  status: string;
  isDeleted: boolean;
}

interface StylistServiceWithPopulatedService {
  serviceId: PopulatedService;
  stylistId: mongoose.Types.ObjectId;
}

interface StylistBranchWithPopulatedBranch {
  branchId: PopulatedBranch;
  stylistId: mongoose.Types.ObjectId;
}

@injectable()
export class StylistRepository implements IStylistRepository {
  private mapDocToListItem(
    stylist: StylistDocument,
    user?: PopulatedUser,
    invite?: StylistInviteDocument,
    branchName?: string,
    assignedServices?: string[],
    assignedServiceDetails?: unknown[],
    weeklySchedule?: IWeeklyScheduleItem[],
  ): StylistListItem {
    return {
      id: stylist._id.toString(),
      userId: stylist.userId.toString(),
      name: user?.name ?? 'Pending Registration',
      email: user?.email,
      phone: user?.phone,
      specialization: stylist.specialization,
      experience: stylist.experience,
      status: stylist.status,
      userStatus: (user?.status ?? 'ACTIVE') as unknown as StylistListItem['userStatus'],
      isBlocked: !!user?.isBlocked,
      inviteStatus: invite?.status as unknown as StylistListItem['inviteStatus'],
      inviteExpiresAt: invite?.expiresAt?.toISOString(),
      inviteLink: invite?.inviteLink,
      position: stylist.position,
      bio: stylist.bio,
      profilePicture: user?.profilePicture || stylist.profilePicture || undefined,
      branchName: branchName || 'N/A',
      assignedServices: assignedServices || [],
      assignedServiceDetails: assignedServiceDetails as StylistListItem['assignedServiceDetails'],
      weeklySchedule,
      rating: stylist.rating || 0,
      reviewCount: stylist.reviewCount || 0,
    };
  }
  async existsByUserId(userId: string): Promise<boolean> {
    const stylist = await StylistModel.findOne({ userId }).select('_id').lean();
    return !!stylist;
  }

  async createStylistDraft(data: CreateStylistInput): Promise<void> {
    await StylistModel.create({
      userId: data.userId,
      specialization: data.specialization,
      experience: data.experience,
      status: 'INACTIVE',
    });
  }

  async activateByUserId(userId: string): Promise<void> {
    await StylistModel.findOneAndUpdate({ userId }, { status: 'ACTIVE' });
  }

  async listAll(): Promise<StylistListItem[]> {
    const stylists = await StylistModel.find().sort({ createdAt: -1 }).lean();

    if (stylists.length === 0) return [];

    const userIds = stylists.map((s) => s.userId);
    const users = await UserModel.find({ _id: { $in: userIds } })
      .select('name email phone isActive isBlocked status')
      .lean<PopulatedUser[]>();

    const userMap = new Map<string, PopulatedUser>();
    users.forEach((u) => userMap.set(u._id.toString(), u));

    const invites = await StylistInviteModel.find({
      userId: { $in: userIds },
      status: 'PENDING',
    })
      .sort({ createdAt: -1 })
      .lean();

    const inviteMap = new Map<string, StylistInviteDocument>();
    invites.forEach((inv) => {
      const uid = inv.userId.toString();
      if (!inviteMap.has(uid)) {
        inviteMap.set(uid, inv);
      }
    });

    return stylists.map((s) => {
      const user = userMap.get(s.userId.toString());
      const invite = inviteMap.get(s.userId.toString());
      return this.mapDocToListItem(s, user, invite);
    });
  }

  async getDraftByUserId(userId: string): Promise<StylistDraft | null> {
    const doc = await StylistModel.findOne({ userId }).select(' specialization experience').lean();
    if (!doc) return null;

    return {
      specialization: doc.specialization,
      experience: doc.experience,
    };
  }

  async getPaginatedStylists(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<StylistListItem>> {
    const { params, search, sort, filters } = PaginationQueryParser.parse(query);

    const finalQuery: MongoFilter = {};
    let filteredUserIds: string[] | null = null;

    if (filters.status) {
      finalQuery.status = filters.status;
    }

    if (typeof filters.isBlocked === 'boolean') {
      const users = await UserModel.find({ isBlocked: filters.isBlocked })
        .select('_id')
        .lean<PopulatedUser[]>();

      filteredUserIds = users.map((u) => u._id.toString());
    }

    if (typeof filters.isActive === 'boolean') {
      const users = await UserModel.find({ isActive: filters.isActive })
        .select('_id')
        .lean<PopulatedUser[]>();

      const activeUserIds = users.map((u) => u._id.toString());

      filteredUserIds = filteredUserIds
        ? filteredUserIds.filter((id) => activeUserIds.includes(id))
        : activeUserIds;
    }

    if (filters.position) {
      finalQuery.position = filters.position;
    }

    if (filters.branchId) {
      const branchStylists = await StylistBranchModel.find({
        branchId: filters.branchId,
        isActive: true,
      })
        .select('stylistId')
        .lean();
      const stylistIdsInBranch = branchStylists.map((bs) => bs.stylistId.toString());

      finalQuery._id = { $in: stylistIdsInBranch };
    }

    if (search) {
      const regex = new RegExp(search, 'i');

      const matchedUsers = await UserModel.find({
        $or: [{ name: regex }, { email: regex }, { phone: regex }],
      })
        .select('_id')
        .lean();

      const searchUserIds = matchedUsers.map((u) => u._id.toString());

      const orConditions: Array<MongoFilter> = [{ specialization: regex }];

      if (searchUserIds.length > 0) {
        orConditions.push({ userId: { $in: searchUserIds } });
      }

      finalQuery.$or = orConditions;
    }

    if (filteredUserIds) {
      finalQuery.userId = { $in: filteredUserIds };
    }

    const [stylists, totalItems] = await Promise.all([
      StylistModel.find(finalQuery).sort(sort).skip(params.skip).limit(params.limit).lean(),
      StylistModel.countDocuments(finalQuery),
    ]);

    if (stylists.length === 0) {
      return PaginationResponseBuilder.build([], totalItems, params.page, params.limit);
    }

    const userIds = stylists.map((s) => s.userId);
    const stylistIds = stylists.map((s) => s._id);

    const [users, invites, branches, stylistServices] = await Promise.all([
      UserModel.find({ _id: { $in: userIds } })
        .select('name email phone isBlocked status profilePicture')
        .lean<PopulatedUser[]>(),
      StylistInviteModel.find({ userId: { $in: userIds } }).lean(),
      StylistBranchModel.find({ stylistId: { $in: stylistIds }, isActive: true })
        .populate({ path: 'branchId', model: BranchModel, select: 'name' })
        .lean<StylistBranchWithPopulatedBranch[]>(),
      StylistServiceModel.find({ stylistId: { $in: stylistIds }, isActive: { $ne: false } })
        .populate({
          path: 'serviceId',
          model: ServiceModel,
          select: 'name categoryId status isDeleted',
        })
        .lean<StylistServiceWithPopulatedService[]>(),
    ]);

    const userMap = new Map<string, PopulatedUser>();
    users.forEach((u) => userMap.set(u._id.toString(), u));

    const inviteMap = new Map<string, StylistInviteDocument>();
    invites.forEach((i) => {
      const uid = i.userId.toString();
      if (!inviteMap.has(uid)) {
        inviteMap.set(uid, i);
      }
    });

    const allCategoryIds = [
      ...new Set(
        stylistServices
          .map((ss) => ss.serviceId?.categoryId?.toString())
          .filter(Boolean) as string[],
      ),
    ];

    const branchIds = [
      ...new Set(
        branches.map((b) => b.branchId?._id?.toString() || b.branchId?.toString()).filter(Boolean),
      ),
    ];

    const branchNameMap = new Map<string, string>();
    branches.forEach((b) => {
      const sid = b.stylistId.toString();
      if (b.branchId?.name) {
        branchNameMap.set(sid, b.branchId.name);
      }
    });

    const stylistToBranchIdMap = new Map<string, string>();
    branches.forEach((b) => {
      const sid = b.stylistId.toString();
      const bid = b.branchId?._id?.toString() || b.branchId?.toString();
      if (bid) stylistToBranchIdMap.set(sid, bid as string);
    });

    const [categories, branchCategories, branchServices] = await Promise.all([
      allCategoryIds.length > 0
        ? CategoryModel.find({
            _id: { $in: allCategoryIds },
            status: { $ne: 'INACTIVE' },
            isDeleted: { $ne: true },
          }).lean()
        : Promise.resolve([]),
      branchIds.length > 0 && allCategoryIds.length > 0
        ? BranchCategoryModel.find({
            branchId: { $in: branchIds },
            categoryId: { $in: allCategoryIds },
            isActive: { $ne: false },
          }).lean()
        : Promise.resolve([]),
      branchIds.length > 0
        ? BranchServiceModel.find({ branchId: { $in: branchIds }, isActive: { $ne: false } }).lean()
        : Promise.resolve([]),
    ]);

    const activeGlobalCategoryIds = new Set(categories.map((c) => c._id.toString()));

    const branchCategoryMap = new Set<string>();
    branchCategories.forEach(
      (bc: { branchId: mongoose.Types.ObjectId; categoryId: mongoose.Types.ObjectId }) => {
        branchCategoryMap.add(`${bc.branchId.toString()}:${bc.categoryId.toString()}`);
      },
    );

    const branchServiceMap = new Set<string>();
    branchServices.forEach(
      (bs: { branchId: mongoose.Types.ObjectId; serviceId: mongoose.Types.ObjectId }) => {
        branchServiceMap.add(`${bs.branchId.toString()}:${bs.serviceId.toString()}`);
      },
    );

    const servicesMap = new Map<string, string[]>();
    stylistServices.forEach((ss) => {
      const service = ss.serviceId;
      if (!service || service.status === 'INACTIVE' || service.isDeleted === true) return;

      const sid = ss.stylistId.toString();
      const branchId = stylistToBranchIdMap.get(sid);
      if (!branchId) return;

      const catId = service.categoryId?.toString();
      if (!catId || !activeGlobalCategoryIds.has(catId)) return;

      if (!branchCategoryMap.has(`${branchId}:${catId}`)) return;
      if (!branchServiceMap.has(`${branchId}:${service._id.toString()}`)) return;

      const existing = servicesMap.get(sid) || [];
      if (existing.length < 3) {
        existing.push(service.name);
        servicesMap.set(sid, existing);
      }
    });

    const result = stylists.map((s) => {
      const user = userMap.get(s.userId.toString());
      const invite = inviteMap.get(s.userId.toString());
      const sid = s._id.toString();

      return this.mapDocToListItem(s, user, invite, branchNameMap.get(sid), servicesMap.get(sid));
    });

    return PaginationResponseBuilder.build(result, totalItems, params.page, params.limit);
  }

  async setBlockedById(stylistId: string, isBlocked: boolean): Promise<StylistListItem | null> {
    const stylist = await StylistModel.findById(stylistId).lean();
    if (!stylist) {
      return null;
    }

    const user = await UserModel.findByIdAndUpdate(stylist.userId, { isBlocked }, { new: true })
      .select('name email phone isBlocked status profilePicture')
      .lean<PopulatedUser>();

    if (!user) {
      return null;
    }

    return this.mapDocToListItem(stylist, user ?? undefined);
  }

  async updatePosition(
    stylistId: string,
    position: 'JUNIOR' | 'SENIOR' | 'TRAINEE',
  ): Promise<StylistListItem | null> {
    const stylist = await StylistModel.findByIdAndUpdate(
      stylistId,
      { position },
      { new: true },
    ).lean();
    if (!stylist) return null;

    const user = await UserModel.findById(stylist.userId)
      .select('name email phone isBlocked status profilePicture')
      .lean<PopulatedUser>();

    return this.mapDocToListItem(stylist, user ?? undefined);
  }

  async getById(stylistId: string): Promise<StylistListItem | null> {
    const stylist = await StylistModel.findById(stylistId).lean();
    if (!stylist) return null;

    const user = await UserModel.findById(stylist.userId)
      .select('name email phone isBlocked status profilePicture')
      .lean<PopulatedUser>();

    // 1. Fetch the active branch association first
    const stylistBranch = await StylistBranchModel.findOne({
      stylistId: stylist._id,
      isActive: { $ne: false },
    })
      .populate({ path: 'branchId', model: BranchModel, select: 'name' })
      .lean<StylistBranchWithPopulatedBranch>();

    const branchDoc = stylistBranch?.branchId;
    const branchIdStr = branchDoc?._id?.toString() || (branchDoc as unknown as string);
    const branchName = branchDoc?.name || (branchIdStr ? 'N/A' : null);

    const [schedules, stylistServices] = await Promise.all([
      StylistWeeklyScheduleModel.find({
        stylistId: stylist._id,
        ...(branchIdStr && { branchId: branchIdStr }),
      }).lean(),
      StylistServiceModel.find({ stylistId: stylist._id, isActive: { $ne: false } })
        .populate({
          path: 'serviceId',
          model: ServiceModel,
          select: 'name imageUrl categoryId status isDeleted',
        })
        .lean<StylistServiceWithPopulatedService[]>(),
    ]);

    const serviceIds = stylistServices.map((ss) => ss.serviceId?._id).filter(Boolean);

    const branchServicesResult = branchIdStr
      ? await BranchServiceModel.find({
          branchId: branchIdStr,
          serviceId: { $in: serviceIds },
          isActive: { $ne: false },
        }).lean<unknown[]>()
      : [];

    const branchServiceMap = new Map<
      string,
      { isActive?: boolean; price: number; duration: number; serviceId: mongoose.Types.ObjectId }
    >();
    branchServicesResult.forEach((bs: unknown) => {
      const b = bs as {
        serviceId: mongoose.Types.ObjectId;
        isActive?: boolean;
        price: number;
        duration: number;
      };
      branchServiceMap.set(b.serviceId.toString(), b);
    });

    // 4. Fetch BranchCategory activity for all unique categories in those services
    const uniqueCategoryIds = [
      ...new Set(
        stylistServices
          .map((ss) => ss.serviceId?.categoryId?.toString())
          .filter(Boolean) as string[],
      ),
    ];

    const [categories, branchCategories] = await Promise.all([
      uniqueCategoryIds.length > 0
        ? CategoryModel.find({
            _id: { $in: uniqueCategoryIds },
            status: { $ne: 'INACTIVE' },
            isDeleted: { $ne: true },
          }).lean()
        : Promise.resolve([]),
      branchIdStr && uniqueCategoryIds.length > 0
        ? BranchCategoryModel.find({
            branchId: branchIdStr,
            categoryId: { $in: uniqueCategoryIds },
            isActive: { $ne: false },
          }).lean()
        : Promise.resolve([]),
    ]);

    const activeCategoryIds = new Set(categories.map((c) => c._id.toString()));
    const activeBranchCategoryIds = new Set(
      branchCategories.map((bc: { categoryId: mongoose.Types.ObjectId }) =>
        bc.categoryId.toString(),
      ),
    );

    // Map schedules to IWeeklyScheduleItem
    const weeklySchedule: IWeeklyScheduleItem[] = schedules.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      isWorkingDay: s.isWorkingDay,
      shifts: (s.shifts || []).map((shift: { startTime: string; endTime: string }) => ({
        startTime: shift.startTime,
        endTime: shift.endTime,
      })),
    }));

    const assignedServiceDetails = stylistServices
      .map((ss) => {
        const service = ss.serviceId;
        if (!service || service.status === 'INACTIVE' || service.isDeleted === true) return null;

        const catId = service.categoryId?.toString();

        if (branchIdStr) {
          if (!catId || !activeCategoryIds.has(catId) || !activeBranchCategoryIds.has(catId)) {
            return null;
          }

          const bs = branchServiceMap.get(service._id.toString());
          if (!bs || bs.isActive === false) return null;

          return {
            id: service._id.toString(),
            name: service.name,
            price: bs.price,
            duration: bs.duration,
            imageUrl: service.imageUrl,
          };
        }

        return null;
      })
      .filter(Boolean) as {
      id: string;
      name: string;
      price: number;
      duration: number;
      imageUrl?: string;
    }[];

    const assignedServices = assignedServiceDetails.map((s) => s.name);

    return this.mapDocToListItem(
      stylist,
      user ?? undefined,
      undefined,
      branchName || undefined,
      assignedServices,
      assignedServiceDetails,
      weeklySchedule,
    );
  }

  async findByUserId(userId: string): Promise<StylistListItem | null> {
    const stylist = await StylistModel.findOne({ userId }).select('_id').lean();
    if (!stylist) return null;
    return this.getById(stylist._id.toString());
  }

  async findIdByUserId(userId: string): Promise<string | null> {
    const stylist = await StylistModel.findOne({ userId }).select('_id').lean();
    return stylist?._id?.toString() || null;
  }

  async updateByUserId(userId: string, data: Partial<StylistListItem>): Promise<void> {
    const updateData: Record<string, unknown> = {};
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.experience !== undefined) updateData.experience = data.experience;
    if (data.position !== undefined) updateData.position = data.position;

    if (Object.keys(updateData).length > 0) {
      await StylistModel.findOneAndUpdate({ userId }, updateData);
    }
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await StylistModel.findByIdAndUpdate(id, data);
  }
}
