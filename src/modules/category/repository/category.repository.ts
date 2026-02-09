import { injectable } from 'tsyringe';
import { CategoryModel } from '../../../models/category.model';
import type { CategoryDocument } from '../../../models/category.model';
import type { ICategoryRepository } from './ICategoryRepository';
import { PaginationQueryParser } from '../../../common/dto/pagination.query.dto';
import type { MongoFilter } from '../../../common/types/mongoFilter';
import { CategoryMapper } from '../mapper/category.mapper';
import type { CategoryPaginationQueryDto } from '../dto/category.request.dto';
import type { CategoryPaginatedResponse } from '../dto/category.response.dto';

@injectable()
export class CategoryRepository implements ICategoryRepository {
  async create(data: { name: string; description?: string }): Promise<CategoryDocument> {
    const doc = new CategoryModel({
      name: data.name.trim().toLowerCase(),
      description: data.description?.trim(),
    });
    await doc.save();
    return doc;
  }

  async findByName(name: string): Promise<CategoryDocument | null> {
    return CategoryModel.findOne({ name: name.trim().toLowerCase() });
  }

  async findById(id: string): Promise<CategoryDocument | null> {
    return CategoryModel.findById(id);
  }

  async listAll(includeDeleted = false): Promise<CategoryDocument[]> {
    const filter = includeDeleted ? {} : { isDeleted: false };
    return CategoryModel.find(filter).sort({ createdAt: -1 });
  }

  async getPaginatedCategories(
    query: CategoryPaginationQueryDto,
  ): Promise<CategoryPaginatedResponse> {
    const { params, search, sort, filters } = PaginationQueryParser.parse(query);

    const finalQuery: MongoFilter = {};

    if (typeof filters.isDeleted === 'boolean') {
      finalQuery.isDeleted = filters.isDeleted;
    }

    if (filters.status) {
      finalQuery.status = filters.status;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      finalQuery.$or = [{ name: regex }, { description: regex }];
    }

    const [categories, totalItems] = await Promise.all([
      CategoryModel.find(finalQuery).sort(sort).skip(params.skip).limit(params.limit).lean(),
      CategoryModel.countDocuments(finalQuery),
    ]);

    if (categories.length === 0) {
      return {
        data: [],
        pagination: {
          currentPage: params.page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: params.limit,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    const result = categories.map((cat) => CategoryMapper.toDto(cat));

    const totalPages = Math.ceil(totalItems / params.limit);
    const hasNextPage = params.page < totalPages;
    const hasPreviousPage = params.page > 1;

    return {
      data: result,
      pagination: {
        currentPage: params.page,
        totalPages,
        totalItems,
        itemsPerPage: params.limit,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async updateById(
    id: string,
    data: Partial<{ name: string; description?: string; status: 'ACTIVE' | 'INACTIVE' }>,
  ): Promise<CategoryDocument | null> {
    return CategoryModel.findByIdAndUpdate(id, data, { new: true });
  }

  async softDelete(id: string): Promise<CategoryDocument | null> {
    return CategoryModel.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date(), status: 'INACTIVE' },
      { new: true },
    );
  }

  async restore(id: string): Promise<CategoryDocument | null> {
    return CategoryModel.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null },
      { new: true },
    );
  }
}
