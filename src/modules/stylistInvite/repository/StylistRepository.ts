import { injectable } from 'tsyringe';
import { StylistModel } from '../../../models/stylist.model';
import { UserModel } from '../../../models/user.model';
import { StylistInviteModel } from '../../../models/stylistInvite.model';
import type { IStylistRepository, StylistListItem } from './IStylistRepository';
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

    const [users, invites] = await Promise.all([
      UserModel.find({ _id: { $in: userIds } })
        .select('name email phone isBlocked status')
        .lean(),
      StylistInviteModel.find({ userId: { $in: userIds } }).lean(),
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

    const result = stylists.map((s) => {
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
        userStatus: user?.status ?? 'ACTIVE',
        isBlocked: !!user?.isBlocked,
        inviteStatus: invite?.status,
        inviteExpiresAt: invite?.expiresAt?.toISOString(),
        inviteLink: invite?.inviteLink,
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
      .select('name email phone isBlocked status')
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
    };
  }
}
