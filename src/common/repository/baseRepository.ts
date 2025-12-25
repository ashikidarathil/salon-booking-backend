import { Model, Document } from 'mongoose';

export abstract class BaseRepository<TDocument extends Document, TEntity> {
  protected readonly _model: Model<TDocument>;

  constructor(model: Model<TDocument>) {
    this._model = model;
  }

  protected abstract toEntity(doc: TDocument): TEntity;

  async findById(id: string): Promise<TEntity | null> {
    const doc = await this._model.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findOne(filter: Record<string, unknown>): Promise<TEntity | null> {
    const doc = await this._model.findOne(filter);
    return doc ? this.toEntity(doc) : null;
  }

  async update(filter: Record<string, unknown>, data: Partial<TDocument>): Promise<TEntity | null> {
    const doc = await this._model.findOneAndUpdate(filter, data, { new: true });
    return doc ? this.toEntity(doc) : null;
  }
}
