"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryMapper = void 0;
class CategoryMapper {
    static toDto(doc) {
        return {
            id: doc._id.toString(),
            name: doc.name,
            description: doc.description,
            status: doc.status,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt.toISOString(),
            updatedAt: doc.updatedAt.toISOString(),
        };
    }
}
exports.CategoryMapper = CategoryMapper;
