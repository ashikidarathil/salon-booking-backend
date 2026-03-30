"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistServiceMapper = void 0;
class StylistServiceMapper {
    static toItem(data) {
        return {
            id: data.serviceId,
            stylistId: data.stylistId,
            serviceId: data.serviceId,
            name: data.name,
            categoryId: data.categoryId,
            categoryName: data.categoryName,
            isActive: data.isActive,
            configured: data.configured,
            price: data.price,
            duration: data.duration,
            createdAt: data.createdAt?.toISOString(),
        };
    }
    static toStatus(data) {
        return {
            stylistId: data.stylistId.toString(),
            serviceId: data.serviceId.toString(),
            isActive: data.isActive,
        };
    }
    static toStylist(data) {
        const stylist = data.stylistId;
        const user = stylist?.userId;
        return {
            stylistId: stylist?._id?.toString() || stylist?.toString() || '',
            userId: user?._id?.toString() || user?.toString() || '',
            name: user?.name || 'Unknown',
            profilePicture: stylist?.profilePicture,
            specialization: stylist?.specialization,
            experience: stylist?.experience,
            isActive: data.isActive,
        };
    }
}
exports.StylistServiceMapper = StylistServiceMapper;
