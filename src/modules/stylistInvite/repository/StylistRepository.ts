import { injectable } from 'tsyringe';
import { StylistModel } from '../../../models/stylist.model';
import { UserModel } from '../../../models/user.model';
import { StylistInviteModel } from '../../../models/stylistInvite.model';
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
      .lean();

    const userMap = new Map<string, (typeof users)[0]>();
    users.forEach((u) => userMap.set(u._id.toString(), u));

    const invites = await StylistInviteModel.find({
      userId: { $in: userIds },
      status: 'PENDING',
    })
      .sort({ createdAt: -1 })
      .lean();

    const inviteMap = new Map<string, (typeof invites)[0]>();
    invites.forEach((inv) => {
      const uid = inv.userId.toString();
      if (!inviteMap.has(uid)) {
        inviteMap.set(uid, inv);
      }
    });

    return stylists.map((s) => {
      const user = userMap.get(s.userId.toString());
      const invite = inviteMap.get(s.userId.toString());

      return {
        id: s._id.toString(),
        userId: s.userId.toString(),
        name: user?.name ?? 'Pending Registration',
        email: user?.email,
        phone: user?.phone,
        specialization: s.specialization,
        experience: s.experience,
        status: s.status,
        userStatus: user?.status || 'ACTIVE',
        inviteStatus: invite?.status,
        inviteExpiresAt: invite?.expiresAt?.toISOString(),
        inviteLink: invite?.inviteLink,
        position: s.position,
        bio: s.bio,
        profilePicture: s.profilePicture,
        isBlocked: !!user?.isBlocked,
      };
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
      const users = await UserModel.find({ isBlocked: filters.isBlocked }).select('_id').lean();

      filteredUserIds = users.map((u) => u._id.toString());
    }

    if (typeof filters.isActive === 'boolean') {
      const users = await UserModel.find({ isActive: filters.isActive }).select('_id').lean();

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
        .lean(),
      StylistInviteModel.find({ userId: { $in: userIds } }).lean(),
      StylistBranchModel.find({ stylistId: { $in: stylistIds }, isActive: true })
        .populate({ path: 'branchId', model: BranchModel, select: 'name' })
        .lean(),
      StylistServiceModel.find({ stylistId: { $in: stylistIds }, isActive: { $ne: false } })
        .populate({
          path: 'serviceId',
          model: ServiceModel,
          select: 'name categoryId status isDeleted',
        })
        .lean(),
    ]);

    const userMap = new Map<string, (typeof users)[0]>();
    users.forEach((u) => userMap.set(u._id.toString(), u));

    const inviteMap = new Map<string, (typeof invites)[0]>();
    invites.forEach((i) => {
      const uid = i.userId.toString();
      if (!inviteMap.has(uid)) {
        inviteMap.set(uid, i);
      }
    });

    // 3. Fetch all potential categories and their branch-level activity
    const allCategoryIds = [
      ...new Set(
        (stylistServices as unknown as StylistServiceWithPopulatedService[])
          .map((ss) => ss.serviceId?.categoryId?.toString())
          .filter(Boolean) as string[],
      ),
    ];

    const branchIds = [
      ...new Set(
        (branches as unknown as StylistBranchWithPopulatedBranch[])
          .map((b) => b.branchId?._id?.toString() || b.branchId?.toString())
          .filter(Boolean),
      ),
    ];

    const branchNameMap = new Map<string, string>();
    (branches as unknown as StylistBranchWithPopulatedBranch[]).forEach((b) => {
      if (b.branchId?.name) {
        branchNameMap.set(b.stylistId.toString(), b.branchId.name);
      }
    });

    const stylistToBranchIdMap = new Map<string, string>();
    (branches as unknown as StylistBranchWithPopulatedBranch[]).forEach((b) => {
      const bid = b.branchId?._id?.toString() || b.branchId?.toString();
      if (bid) stylistToBranchIdMap.set(b.stylistId.toString(), bid);
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

    const branchCategoryMap = new Set<string>(); // "branchId:categoryId"
    (
      branchCategories as unknown as Record<
        string,
        { branchId: { toString(): string }; categoryId: { toString(): string } }
      >[]
    ).forEach((bc) => {
      branchCategoryMap.add(`${bc.branchId.toString()}:${bc.categoryId.toString()}`);
    });

    const branchServiceMap = new Set<string>(); // "branchId:serviceId"
    (
      branchServices as unknown as Record<
        string,
        { branchId: { toString(): string }; serviceId: { toString(): string } }
      >[]
    ).forEach((bs) => {
      branchServiceMap.add(`${bs.branchId.toString()}:${bs.serviceId.toString()}`);
    });

    const servicesMap = new Map<string, string[]>();
    (stylistServices as unknown as StylistServiceWithPopulatedService[]).forEach((ss) => {
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

      return {
        id: sid,
        userId: s.userId.toString(),
        name: user?.name ?? 'Pending Registration',
        email: user?.email,
        phone: user?.phone,
        specialization: s.specialization,
        experience: s.experience,
        status: s.status,
        userStatus: user?.status ?? 'ACTIVE',
        isBlocked: !!user?.isBlocked,
        inviteStatus: invite?.status,
        inviteExpiresAt: invite?.expiresAt?.toISOString(),
        inviteLink: invite?.inviteLink,
        position: s.position,
        bio: s.bio,
        profilePicture: user?.profilePicture || undefined,
        branchName: branchNameMap.get(sid) || 'N/A',
        assignedServices: servicesMap.get(sid) || [],
        rating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 200) + 50,
      };
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
      .lean();

    if (!user) {
      return null;
    }

    return {
      id: stylist._id.toString(),
      userId: stylist.userId.toString(),
      name: user.name ?? 'Pending Registration',
      email: user.email,
      phone: user.phone,
      specialization: stylist.specialization,
      experience: stylist.experience,
      status: stylist.status,
      userStatus: user.status ?? 'ACTIVE',
      isBlocked: !!user.isBlocked,
      position: stylist.position,
      bio: stylist.bio,
      profilePicture: user.profilePicture || undefined,
    };
  }

  async updatePosition(
    stylistId: string,
    position: 'JUNIOR' | 'SENIOR' | 'TRAINEE',
  ): Promise<StylistListItem | null> {
    const stylist = await StylistModel.findByIdAndUpdate(stylistId, { position }, { new: true });
    if (!stylist) return null;

    const user = await UserModel.findById(stylist.userId)
      .select('name email phone isBlocked status profilePicture')
      .lean();

    return {
      id: stylist._id.toString(),
      userId: stylist.userId.toString(),
      name: user?.name ?? 'Pending Registration',
      email: user?.email,
      phone: user?.phone,
      specialization: stylist.specialization,
      experience: stylist.experience,
      status: stylist.status,
      userStatus: user?.status ?? 'ACTIVE',
      isBlocked: !!user?.isBlocked,
      position: stylist.position,
      bio: stylist.bio,
      profilePicture: user?.profilePicture || undefined,
    };
  }

  async getById(stylistId: string): Promise<StylistListItem | null> {
    const stylist = await StylistModel.findById(stylistId).lean();
    if (!stylist) return null;

    const user = await UserModel.findById(stylist.userId)
      .select('name email phone isBlocked status profilePicture')
      .lean();

    // 1. Fetch the active branch association first
    const stylistBranch = await StylistBranchModel.findOne({
      stylistId: stylist._id,
      isActive: { $ne: false },
    })
      .populate({ path: 'branchId', model: BranchModel, select: 'name' })
      .lean();

    const branchDoc = stylistBranch?.branchId as unknown as PopulatedBranch;
    const branchIdStr = branchDoc?._id?.toString() || (branchDoc as unknown as string);
    const branchName = branchDoc?.name || (branchIdStr ? 'N/A' : null);

    // 2. Fetch everything else concurrently
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
        .lean(),
    ]);

    const serviceIds = (stylistServices as unknown as StylistServiceWithPopulatedService[])
      .map((ss) => ss.serviceId?._id)
      .filter(Boolean);

    // 3. Fetch BranchService price/duration for these services
    const branchServicesResult = branchIdStr
      ? await BranchServiceModel.find({
          branchId: branchIdStr,
          serviceId: { $in: serviceIds },
          isActive: { $ne: false },
        }).lean()
      : [];

    const branchServiceMap = new Map<string, (typeof branchServicesResult)[0]>();
    (
      branchServicesResult as unknown as Record<string, { serviceId: { toString(): string } }>[]
    ).forEach((bs) => branchServiceMap.set(bs.serviceId.toString(), bs));

    // 4. Fetch BranchCategory activity for all unique categories in those services
    const uniqueCategoryIds = [
      ...new Set(
        (stylistServices as unknown as StylistServiceWithPopulatedService[])
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
      (branchCategories as unknown as Record<string, { categoryId: { toString(): string } }>[]).map(
        (bc) => bc.categoryId.toString(),
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

    const assignedServiceDetails = (
      stylistServices as unknown as StylistServiceWithPopulatedService[]
    )
      .map((ss) => {
        const service = ss.serviceId;
        if (!service || service.status === 'INACTIVE' || service.isDeleted === true) return null;

        const catId = service.categoryId?.toString();

        // Strictly check branch assignment for both service and category if branchIdStr exists
        if (branchIdStr) {
          // 1. Category check (must be active globally AND assigned/active in branch)
          if (!catId || !activeCategoryIds.has(catId) || !activeBranchCategoryIds.has(catId))
            return null;

          // 2. Service-Branch check (must be assigned/active in branch)
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

        // If no active branch assignment found for the stylist, we don't list services as we lack price/duration
        return null;
      })
      .filter(Boolean) as {
      id: string;
      name: string;
      price: number;
      duration: number;
      imageUrl: string;
    }[];

    const assignedServices = assignedServiceDetails.map((s) => s.name);

    return {
      id: stylist._id.toString(),
      userId: stylist.userId.toString(),
      name: user?.name ?? 'Pending Registration',
      email: user?.email,
      phone: user?.phone,
      specialization: stylist.specialization,
      experience: stylist.experience,
      status: stylist.status,
      userStatus: user?.status ?? 'ACTIVE',
      isBlocked: !!user?.isBlocked,
      position: stylist.position,
      bio: stylist.bio,
      profilePicture: user?.profilePicture || undefined,
      branchName: branchName || 'N/A',
      assignedServices,
      assignedServiceDetails,
      weeklySchedule,
      rating: 5.0,
      reviewCount: 142,
    };
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
}
