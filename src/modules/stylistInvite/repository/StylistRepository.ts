import { injectable } from 'tsyringe';
import { StylistModel } from '../../../models/stylist.model';
import { UserModel } from '../../../models/user.model';
import { StylistInviteModel } from '../../../models/stylistInvite.model';
import { StylistBranchModel } from '../../../models/stylistBranch.model';
import { StylistServiceModel } from '../../../models/stylistService.model';
import { BranchModel } from '../../../models/branch.model';
import { ServiceModel } from '../../../models/service.model';
import { StylistWeeklyScheduleModel } from '../../../models/stylistWeeklySchedule.model';
import type { IStylistRepository, StylistListItem, IWeeklyScheduleItem } from './IStylistRepository';
import { CreateStylistInput } from '../type/CreateStylistInput';
import { StylistDraft } from './IStylistRepository';
import type { MongoFilter } from '../../../common/types/mongoFilter';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { PaginationQueryParser } from '../../../common/dto/pagination.query.dto';
import { PaginationResponseBuilder } from '../../../common/dto/pagination.response.dto';

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
      StylistServiceModel.find({ stylistId: { $in: stylistIds }, isActive: true })
        .populate({ path: 'serviceId', model: ServiceModel, select: 'name' })
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

    const branchMap = new Map<string, string>();
    branches.forEach((b: any) => {
      if (b.branchId && b.branchId.name) {
        branchMap.set(b.stylistId.toString(), b.branchId.name);
      }
    });

    const servicesMap = new Map<string, string[]>();
    stylistServices.forEach((ss: any) => {
      if (ss.serviceId && ss.serviceId.name) {
        const sid = ss.stylistId.toString();
        const existing = servicesMap.get(sid) || [];
        if (existing.length < 3) {
          existing.push(ss.serviceId.name);
          servicesMap.set(sid, existing);
        }
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
        branchName: branchMap.get(sid) || 'N/A',
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
      isActive: true,
    })
      .populate({ path: 'branchId', model: BranchModel, select: 'name' })
      .lean();

    const branchId = stylistBranch?.branchId;
    const branchName = (branchId as any)?.name || 'N/A';

    // 2. Fetch everything else concurrently
    const [schedules, stylistServices] = await Promise.all([
      StylistWeeklyScheduleModel.find({
        stylistId: stylist._id,
        ...(branchId && { branchId: (branchId as any)._id || branchId }),
      }).lean(),
      StylistServiceModel.find({ stylistId: stylist._id, isActive: true })
        .populate({ path: 'serviceId', model: ServiceModel, select: 'name' })
        .lean(),
    ]);

    // Map schedules to IWeeklyScheduleItem
    const weeklySchedule: IWeeklyScheduleItem[] = schedules.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      isWorkingDay: s.isWorkingDay,
      shifts: (s.shifts || []).map((shift: any) => ({
        startTime: shift.startTime,
        endTime: shift.endTime,
      })),
    }));

    const assignedServices = stylistServices
      .map((ss: any) => ss.serviceId?.name)
      .filter(Boolean);

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
      branchName,
      assignedServices,
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

  async updateByUserId(userId: string, data: Partial<StylistListItem>): Promise<void> {
    const updateData: any = {};
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.experience !== undefined) updateData.experience = data.experience;
    if (data.position !== undefined) updateData.position = data.position;

    if (Object.keys(updateData).length > 0) {
      await StylistModel.findOneAndUpdate({ userId }, updateData);
    }
  }
}
