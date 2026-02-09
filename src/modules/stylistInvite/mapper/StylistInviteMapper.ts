import type { StylistListItem } from '../repository/IStylistRepository';
import type { StylistListResponse } from '../dto/response/StylistList.response';

export class StylistMapper {
  static toListResponse(item: StylistListItem): StylistListResponse {
    return {
      id: item.id,
      userId: item.userId,
      name: item.name,
      email: item.email,
      phone: item.phone,
      specialization: item.specialization,
      experience: item.experience,
      status: item.status,
      isBlocked: item.isBlocked,
      userStatus: item.userStatus,
      inviteStatus: item.inviteStatus,
      inviteExpiresAt: item.inviteExpiresAt,
      inviteLink: item.inviteLink,
    };
  }

  static toListResponseArray(items: StylistListItem[]): StylistListResponse[] {
    return items.map((item) => StylistMapper.toListResponse(item));
  }
}
