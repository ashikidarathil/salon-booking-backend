"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistMapper = void 0;
class WishlistMapper {
    static toResponse(doc) {
        return {
            id: String(doc._id),
            userId: doc.userId.toString(),
            stylistId: doc.stylistId.toString(),
            createdAt: doc.createdAt.toISOString(),
            updatedAt: doc.updatedAt.toISOString(),
        };
    }
}
exports.WishlistMapper = WishlistMapper;
