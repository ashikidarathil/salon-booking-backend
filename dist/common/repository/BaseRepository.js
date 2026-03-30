"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this._model = model;
    }
    async findById(id, populate) {
        let query = this._model.findById(id);
        if (populate)
            query = query.populate(populate);
        const doc = await query.exec();
        return doc ? this.toEntity(doc) : null;
    }
    async findOne(filter, populate) {
        let query = this._model.findOne(filter);
        if (populate)
            query = query.populate(populate);
        const doc = await query.exec();
        return doc ? this.toEntity(doc) : null;
    }
    async find(filter, populate, sort) {
        let query = this._model.find(filter);
        if (populate)
            query = query.populate(populate);
        if (sort)
            query = query.sort(sort);
        const docs = await query.exec();
        return docs.map((doc) => this.toEntity(doc));
    }
    async create(data, session) {
        const doc = new this._model(data);
        const savedDoc = await doc.save({ session });
        return this.toEntity(savedDoc);
    }
    async update(id, data, session) {
        const doc = await this._model.findByIdAndUpdate(id, data, {
            new: true,
            session,
        });
        return doc ? this.toEntity(doc) : null;
    }
    async delete(id, session) {
        const result = await this._model.findByIdAndDelete(id, { session });
        return !!result;
    }
    async softDelete(id, session) {
        const doc = await this._model.findByIdAndUpdate(id, { isDeleted: true }, { new: true, session });
        return !!doc;
    }
    async save(doc) {
        const savedDoc = await doc.save();
        return this.toEntity(savedDoc);
    }
    async count(filter) {
        return this._model.countDocuments(filter);
    }
}
exports.BaseRepository = BaseRepository;
