export type QueryValue = string | number | boolean | undefined;

export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: QueryValue;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface ParsedQuery {
  params: PaginationParams;
  search: string | undefined;
  sort: Record<string, 1 | -1>;
  filters: Record<string, string | number | boolean>;
}

export class PaginationQueryParser {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly MAX_LIMIT = 100;
  private static readonly EXCLUDE_KEYS = [
    'page',
    'limit',
    'search',
    'sortBy',
    'sortOrder',
  ] as const;

  static parse(query: PaginationQueryDto): ParsedQuery {
    const page = this.parsePage(query.page);
    const limit = this.parseLimit(query.limit);
    const skip = (page - 1) * limit;

    const sortBy = this.parseSortBy(query.sortBy);
    const sortOrder = this.parseSortOrder(query.sortOrder);
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const search = this.parseSearch(query.search);
    const filters = this.extractFilters(query);

    return {
      params: { page, limit, skip },
      search,
      sort,
      filters,
    };
  }

  private static parsePage(page: number | undefined): number {
    if (!page) return this.DEFAULT_PAGE;
    const parsed = Math.max(1, Number.isNaN(page) ? this.DEFAULT_PAGE : page);
    return parsed;
  }

  private static parseLimit(limit: number | undefined): number {
    if (!limit) return this.DEFAULT_LIMIT;
    const parsed = Number.isNaN(limit) ? this.DEFAULT_LIMIT : limit;
    return Math.min(this.MAX_LIMIT, Math.max(1, parsed));
  }

  private static parseSortBy(sortBy: string | undefined): string {
    return sortBy?.trim() ? sortBy.trim() : 'createdAt';
  }

  private static parseSortOrder(sortOrder: 'asc' | 'desc' | undefined): 1 | -1 {
    return sortOrder === 'asc' ? 1 : -1;
  }

  private static parseSearch(search: string | undefined): string | undefined {
    if (!search) return undefined;
    const trimmed = search.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private static extractFilters(
    query: PaginationQueryDto,
  ): Record<string, string | number | boolean> {
    const filters: Record<string, string | number | boolean> = {};

    for (const [key, value] of Object.entries(query)) {
      if (this.EXCLUDE_KEYS.includes(key as (typeof this.EXCLUDE_KEYS)[number])) continue;
      if (value === undefined || value === null || value === '') continue;

      if (value === 'true') filters[key] = true;
      else if (value === 'false') filters[key] = false;
      else filters[key] = value;
    }

    return filters;
  }

  static buildSearchQuery(
    search: string | undefined,
    searchableFields: readonly string[],
  ): Record<string, unknown> {
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
