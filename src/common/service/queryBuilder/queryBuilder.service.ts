import { injectable } from 'tsyringe';
import { Model } from 'mongoose';
import { PaginationQueryDto, PaginationQueryParser } from '../../dto/pagination.query.dto';
import { PaginatedResponse, PaginationResponseBuilder } from '../../dto/pagination.response.dto';
import { MongoFilter } from '../../types/mongoFilter';

@injectable()
export class QueryBuilderService {
  async paginate<TSchema, TEntity>(
    model: Model<TSchema>,
    query: PaginationQueryDto,
    searchableFields: readonly (keyof TSchema & string)[],
    mapper: (doc: TSchema) => TEntity,
  ): Promise<PaginatedResponse<TEntity>> {
    const { params, search, sort, filters } = PaginationQueryParser.parse(query);

    const searchQuery = search
      ? PaginationQueryParser.buildSearchQuery(search, searchableFields)
      : {};

    const finalQuery: MongoFilter = {
      ...searchQuery,
      ...filters,
    };

    const [data, totalItems] = await Promise.all([
      model
        .find(finalQuery)
        .sort(sort)
        .skip(params.skip)
        .limit(params.limit)
        .lean<TSchema[]>()
        .exec(),
      model.countDocuments(finalQuery),
    ]);

    return PaginationResponseBuilder.build(data.map(mapper), totalItems, params.page, params.limit);
  }

  async paginateSimple<TSchema, TEntity>(
    model: Model<TSchema>,
    page = 1,
    limit = 10,
    mapper: (doc: TSchema) => TEntity,
  ): Promise<PaginatedResponse<TEntity>> {
    return this.paginate(model, { page, limit }, [], mapper);
  }

  async count<TSchema>(model: Model<TSchema>, filters: MongoFilter = {}): Promise<number> {
    return model.countDocuments(filters);
  }

  async exists<TSchema>(
    model: Model<TSchema>,
    field: keyof TSchema & string,
    value: unknown,
    excludeId?: string,
  ): Promise<boolean> {
    const query: MongoFilter = { [field]: value };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return (await model.countDocuments(query)) > 0;
  }
}
