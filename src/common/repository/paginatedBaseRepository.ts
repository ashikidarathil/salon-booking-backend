import { Model, UpdateQuery, PopulateOptions } from 'mongoose';
import { QueryBuilderService } from '../service/queryBuilder/queryBuilder.service';
import { PaginationQueryDto } from '../dto/pagination.query.dto';
import { PaginatedResponse } from '../dto/pagination.response.dto';
import { MongoFilter } from '../types/mongoFilter';

export abstract class PaginatedBaseRepository<TSchema, TEntity> {
  protected readonly _model: Model<TSchema>;
  protected readonly _queryBuilder: QueryBuilderService;

  constructor(model: Model<TSchema>, queryBuilder: QueryBuilderService) {
    this._model = model;
    this._queryBuilder = queryBuilder;
  }

  protected abstract toEntity(doc: TSchema): TEntity;
  protected getSearchableFields(): readonly (keyof TSchema & string)[] {
    return [];
  }

  async findById(id: string, populate?: (string | PopulateOptions)[]): Promise<TEntity | null> {
    let query = this._model.findById(id);
    if (populate) query = query.populate(populate);
    const doc = await query.lean<TSchema>().exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findOne(
    filter: MongoFilter = {},
    populate?: (string | PopulateOptions)[],
  ): Promise<TEntity | null> {
    let query = this._model.findOne(filter);
    if (populate) query = query.populate(populate);
    const doc = await query.lean<TSchema>().exec();
    return doc ? this.toEntity(doc) : null;
  }

  async update(
    filter: MongoFilter,
    data: UpdateQuery<TSchema>,
    populate?: (string | PopulateOptions)[],
  ): Promise<TEntity | null> {
    let query = this._model.findOneAndUpdate(filter, data, { new: true });
    if (populate) query = query.populate(populate);
    const doc = await query.lean<TSchema>().exec();

    return doc ? this.toEntity(doc) : null;
  }

  async findAll(
    filter: MongoFilter = {},
    populate?: (string | PopulateOptions)[],
  ): Promise<TEntity[]> {
    let query = this._model.find(filter);
    if (populate) query = query.populate(populate);
    const docs = await query.lean<TSchema[]>().exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async getPaginated(
    query: PaginationQueryDto,
    populate?: (string | PopulateOptions)[],
  ): Promise<PaginatedResponse<TEntity>> {
    return this._queryBuilder.paginate(
      this._model,
      query,
      this.getSearchableFields(),
      (doc) => this.toEntity(doc),
      populate,
    );
  }

  async count(filters: MongoFilter = {}): Promise<number> {
    return this._queryBuilder.count(this._model, filters);
  }
}
