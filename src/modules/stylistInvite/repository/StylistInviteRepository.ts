import { injectable } from 'tsyringe';
import { StylistInviteModel } from '../../../models/stylistInvite.model';
import { StylistInviteEntity } from '../type/StylistInviteEntity';
import { CreateInviteInput } from '../type/CreateInviteInput';
import type { IStylistInviteRepository } from './IStylistInviteRepository';
import type { StylistInviteDocument } from '../../../models/stylistInvite.model';

@injectable()
export class StylistInviteRepository implements IStylistInviteRepository {
  async createInvite(data: CreateInviteInput): Promise<StylistInviteEntity> {
    const doc = await StylistInviteModel.create({
      email: data.email,
      userId: data.userId,
      tokenHash: data.tokenHash,
      rawToken: data.rawToken,
      inviteLink: data.inviteLink,
      expiresAt: data.expiresAt,
      status: 'PENDING',
      specialization: data.specialization,
      experience: data.experience,
      createdBy: data.createdBy,
    });
    return this.toEntity(doc);
  }

  async findPendingByTokenHash(tokenHash: string): Promise<StylistInviteEntity | null> {
    const doc = await StylistInviteModel.findOne({ tokenHash, status: 'PENDING' }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async markAccepted(inviteId: string): Promise<void> {
    await StylistInviteModel.findByIdAndUpdate(inviteId, {
      status: 'ACCEPTED',
      usedAt: new Date(),
    });
  }

  async markExpired(inviteId: string): Promise<void> {
    await StylistInviteModel.findByIdAndUpdate(inviteId, { status: 'EXPIRED' });
  }

  async cancelByUserId(userId: string): Promise<void> {
    await StylistInviteModel.updateMany({ userId, status: 'PENDING' }, { status: 'CANCELLED' });
  }

  async findLatestByUserIds(
    userIds: string[],
  ): Promise<Record<string, StylistInviteEntity | undefined>> {
    const docs = await StylistInviteModel.find({ userId: { $in: userIds } })
      .sort({ createdAt: -1 })
      .lean();

    const map: Record<string, StylistInviteEntity | undefined> = {};
    docs.forEach((d) => {
      const uid = d.userId.toString();
      if (!map[uid]) map[uid] = this.toEntity(d);
    });
    return map;
  }

  private toEntity(doc: StylistInviteDocument): StylistInviteEntity {
    return {
      id: doc._id.toString(),
      email: doc.email,
      userId: doc.userId.toString(),
      tokenHash: doc.tokenHash,
      rawToken: doc.rawToken,
      inviteLink: doc.inviteLink,
      expiresAt: doc.expiresAt,
      status: doc.status,
      usedAt: doc.usedAt,
      specialization: doc.specialization,
      experience: doc.experience,
      createdBy: doc.createdBy.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
