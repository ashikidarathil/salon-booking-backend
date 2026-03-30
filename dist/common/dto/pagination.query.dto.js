"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationQueryParser = void 0;
class PaginationQueryParser {
    static parse(query) {
        const page = this.parsePage(query.page);
        const limit = this.parseLimit(query.limit);
        const skip = (page - 1) * limit;
        const sortBy = this.parseSortBy(query.sortBy);
        const sortOrder = this.parseSortOrder(query.sortOrder);
        const sort = { [sortBy]: sortOrder };
        const search = this.parseSearch(query.search);
        const filters = this.extractFilters(query);
        return {
            params: { page, limit, skip },
            search,
            sort,
            filters,
        };
    }
    static parsePage(page) {
        if (!page)
            return this.DEFAULT_PAGE;
        const parsed = Math.max(1, Number.isNaN(page) ? this.DEFAULT_PAGE : page);
        return parsed;
    }
    static parseLimit(limit) {
        if (!limit)
            return this.DEFAULT_LIMIT;
        const parsed = Number.isNaN(limit) ? this.DEFAULT_LIMIT : limit;
        return Math.min(this.MAX_LIMIT, Math.max(1, parsed));
    }
    static parseSortBy(sortBy) {
        return sortBy?.trim() ? sortBy.trim() : 'createdAt';
    }
    static parseSortOrder(sortOrder) {
        return sortOrder === 'asc' ? 1 : -1;
    }
    static parseSearch(search) {
        if (!search)
            return undefined;
        const trimmed = search.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }
    static extractFilters(query) {
        const filters = {};
        for (const [key, value] of Object.entries(query)) {
            if (this.EXCLUDE_KEYS.includes(key))
                continue;
            if (value === undefined || value === null || value === '')
                continue;
            if (value === 'true')
                filters[key] = true;
            else if (value === 'false')
                filters[key] = false;
            else
                filters[key] = value;
        }
        return filters;
    }
    static buildSearchQuery(search, searchableFields) {
        if (!search || searchableFields.length === 0) {
            return {};
        }
        return {
            $or: searchableFields.map((field) => ({
                [field]: { $regex: search, $options: 'i' },
            })),
        };
    }
}
exports.PaginationQueryParser = PaginationQueryParser;
PaginationQueryParser.DEFAULT_PAGE = 1;
PaginationQueryParser.DEFAULT_LIMIT = 10;
PaginationQueryParser.MAX_LIMIT = 100;
PaginationQueryParser.EXCLUDE_KEYS = [
    'page',
    'limit',
    'search',
    'sortBy',
    'sortOrder',
    'startDate',
    'endDate',
];
