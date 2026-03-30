"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistMapper = void 0;
class StylistMapper {
    static toListResponse(item) {
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
    static toListResponseArray(items) {
        return items.map((item) => StylistMapper.toListResponse(item));
    }
}
exports.StylistMapper = StylistMapper;
