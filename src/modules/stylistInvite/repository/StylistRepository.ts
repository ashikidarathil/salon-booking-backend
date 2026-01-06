import { injectable } from 'tsyringe';
import { StylistModel } from '../../../models/stylist.model';
import { UserModel } from '../../../models/user.model';
import { StylistInviteModel } from '../../../models/stylistInvite.model';
import type { IStylistRepository, StylistListItem } from './IStylistRepository';
import { CreateStylistInput } from '../type/CreateStylistInput';
import { StylistDraft } from './IStylistRepository';

@injectable()
export class StylistRepository implements IStylistRepository {
  async existsByUserId(userId: string): Promise<boolean> {
    const stylist = await StylistModel.findOne({ userId }).select('_id').lean();
    return !!stylist;
  }

  async createStylistDraft(data: CreateStylistInput): Promise<void> {
    await StylistModel.create({
      userId: data.userId,
      branchId: data.branchId,
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
      status: 'PENDING', // Only show active/pending invites
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
    const doc = await StylistModel.findOne({ userId })
      .select('branchId specialization experience')
      .lean();
    if (!doc) return null;

    return {
      branchId: doc.branchId ? doc.branchId.toString() : undefined,
      specialization: doc.specialization,
      experience: doc.experience,
    };
  }
}
