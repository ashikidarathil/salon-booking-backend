import { injectable } from 'tsyringe';
import { ServiceModel } from '../../../models/service.model';
import type { ServiceDocument } from '../../../models/service.model';
import type { IServiceRepository } from './IServiceRepository';
import type { ServicePaginationQueryDto } from '../dto/service.request.dto';
import type { ServicePaginatedResponse } from '../dto/service.response.dto';
import { PaginationQueryParser } from '../../../common/dto/pagination.query.dto';
import type { MongoFilter } from '../../../common/types/mongoFilter';
import { ServiceMapper } from '../mapper/service.mapper';

@injectable()
export class ServiceRepository implements IServiceRepository {
  async create(data: {
    name: string;
    description?: string;
    categoryId: string;
    imageUrl?: string;
    whatIncluded?: string[];
  }): Promise<ServiceDocument> {
    const doc = new ServiceModel({
      name: data.name.trim().toLowerCase(),
      description: data.description?.trim(),
      categoryId: data.categoryId,
      imageUrl: data.imageUrl,
      whatIncluded: data.whatIncluded || [],
    });

    await doc.save();
    return doc;
  }

  async findById(id: string): Promise<ServiceDocument | null> {
    return ServiceModel.findById(id);
  }

  async findByNameAndCategory(name: string, categoryId: string): Promise<ServiceDocument | null> {
    return ServiceModel.findOne({
      name: name.trim(),
      categoryId,
    });
  }

  async listAll(includeDeleted = false): Promise<ServiceDocument[]> {
    const filter = includeDeleted ? {} : { isDeleted: false };
    return ServiceModel.find(filter)
      .populate('categoryId', 'name status isDeleted')
      .sort({ createdAt: -1 });
  }

  async updateById(
    id: string,
    data: Partial<{
      name: string;
      description?: string;
      status: 'ACTIVE' | 'INACTIVE';
      imageUrl: string;
      categoryId: string;
      whatIncluded?: string[];
    }>,
  ): Promise<ServiceDocument | null> {
    return ServiceModel.findByIdAndUpdate(id, data, { new: true });
  }

  async updateImageUrl(id: string, imageUrl: string): Promise<ServiceDocument | null> {
    return ServiceModel.findByIdAndUpdate(id, { imageUrl }, { new: true });
  }

  async softDelete(id: string): Promise<ServiceDocument | null> {
    return ServiceModel.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date(), status: 'INACTIVE' },
      { new: true },
    );
  }

  async restore(id: string): Promise<ServiceDocument | null> {
    return ServiceModel.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null }, { new: true });
  }

  async getPaginatedServices(query: ServicePaginationQueryDto): Promise<ServicePaginatedResponse> {
    const { params, search, sort, filters } = PaginationQueryParser.parse(query);

    const finalQuery: MongoFilter = {};

    if (typeof filters.isDeleted === 'boolean') {
      finalQuery.isDeleted = filters.isDeleted;
    } else {
      finalQuery.isDeleted = false;
    }

    if (filters.status) {
      finalQuery.status = filters.status;
    }

    if (filters.categoryId) {
      finalQuery.categoryId = filters.categoryId;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      finalQuery.$or = [{ name: regex }, { description: regex }];
    }

    const [services, totalItems] = await Promise.all([
      ServiceModel.find(finalQuery)
        .populate('categoryId', 'name status isDeleted')
        .sort(sort)
        .skip(params.skip)
        .limit(params.limit)
        .lean(),
      ServiceModel.countDocuments(finalQuery),
    ]);
    if (services.length === 0) {
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

    const result = services.map((svc) => ServiceMapper.toDto(svc));

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
}
