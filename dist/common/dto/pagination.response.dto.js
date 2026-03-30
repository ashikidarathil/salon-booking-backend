"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationResponseBuilder = void 0;
class PaginationResponseBuilder {
    static build(data, totalItems, page, limit) {
        const totalPages = Math.ceil(totalItems / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        return {
            data,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage,
                hasPreviousPage,
            },
        };
    }
}
exports.PaginationResponseBuilder = PaginationResponseBuilder;
