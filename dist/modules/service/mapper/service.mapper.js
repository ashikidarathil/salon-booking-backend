"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceMapper = void 0;
class ServiceMapper {
    static toDto(doc) {
        return {
            id: doc._id.toString(),
            name: doc.name,
            description: doc.description,
            categoryId: doc.categoryId?._id ? doc.categoryId._id.toString() : doc.categoryId?.toString(),
            imageUrl: doc.imageUrl,
            whatIncluded: doc.whatIncluded || [],
            status: doc.status,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt.toISOString(),
            updatedAt: doc.updatedAt.toISOString(),
        };
    }
}
exports.ServiceMapper = ServiceMapper;
