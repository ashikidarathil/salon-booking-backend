import { Model, Document, UpdateQuery, ClientSession, PopulateOptions } from 'mongoose';

export type SortOrder = 1 | -1 | 'asc' | 'desc' | 'ascending' | 'descending';
export type SortOptions =
  | string
  | { [key: string]: SortOrder | { $meta: 'textScore' } }
  | [string, SortOrder][];
type MongoFilter = Record<string, unknown>;

export abstract class BaseRepository<TDocument extends Document, TEntity> {
  protected readonly _model: Model<TDocument>;

  constructor(model: Model<TDocument>) {
    this._model = model;
  }

  protected abstract toEntity(doc: TDocument): TEntity;

  async findById(id: string, populate?: PopulateOptions[]): Promise<TEntity | null> {
    let query = this._model.findById(id);
    if (populate) query = query.populate(populate);
    const doc = await query.exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findOne(filter: MongoFilter, populate?: PopulateOptions[]): Promise<TEntity | null> {
    let query = this._model.findOne(filter);
    if (populate) query = query.populate(populate);
    const doc = await query.exec();
    return doc ? this.toEntity(doc) : null;
  }

  async find(
    filter: MongoFilter,
    populate?: PopulateOptions[],
    sort?: SortOptions,
  ): Promise<TEntity[]> {
    let query = this._model.find(filter);
    if (populate) query = query.populate(populate);
    if (sort) query = query.sort(sort);
    const docs = await query.exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async create(data: Partial<TDocument>, session?: ClientSession): Promise<TEntity> {
    const doc = new this._model(data);
    const savedDoc = await doc.save({ session });
    return this.toEntity(savedDoc as TDocument);
  }

  async update(
    id: string,
    data: UpdateQuery<TDocument>,
    session?: ClientSession,
  ): Promise<TEntity | null> {
    const doc = await this._model.findByIdAndUpdate(id, data, {
      new: true,
      session,
    });
    return doc ? this.toEntity(doc) : null;
  }

  async delete(id: string, session?: ClientSession): Promise<boolean> {
    const result = await this._model.findByIdAndDelete(id, { session });
    return !!result;
  }

  async softDelete(id: string, session?: ClientSession): Promise<boolean> {
    const doc = await this._model.findByIdAndUpdate(
      id,
      { isDeleted: true } as UpdateQuery<TDocument>,
      { new: true, session },
    );
    return !!doc;
  }

  async save(doc: TDocument): Promise<TEntity> {
    const savedDoc = await doc.save();
    return this.toEntity(savedDoc);
  }

  async count(filter: MongoFilter): Promise<number> {
    return this._model.countDocuments(filter);
  }
}
