"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedBaseRepository = void 0;
class PaginatedBaseRepository {
    constructor(model, queryBuilder) {
        this._model = model;
        this._queryBuilder = queryBuilder;
    }
    getSearchableFields() {
        return [];
    }
    async findById(id, populate) {
        let query = this._model.findById(id);
        if (populate)
            query = query.populate(populate);
        const doc = await query.lean().exec();
        return doc ? this.toEntity(doc) : null;
    }
    async findOne(filter = {}, populate) {
        let query = this._model.findOne(filter);
        if (populate)
            query = query.populate(populate);
        const doc = await query.lean().exec();
        return doc ? this.toEntity(doc) : null;
    }
    async update(filter, data, populate) {
        let query = this._model.findOneAndUpdate(filter, data, { new: true });
        if (populate)
            query = query.populate(populate);
        const doc = await query.lean().exec();
        return doc ? this.toEntity(doc) : null;
    }
    async findAll(filter = {}, populate) {
        let query = this._model.find(filter);
        if (populate)
            query = query.populate(populate);
        const docs = await query.lean().exec();
        return docs.map((doc) => this.toEntity(doc));
    }
    async getPaginated(query, populate) {
        return this._queryBuilder.paginate(this._model, query, this.getSearchableFields(), (doc) => this.toEntity(doc), populate);
    }
    async count(filters = {}) {
        return this._queryBuilder.count(this._model, filters);
    }
}
exports.PaginatedBaseRepository = PaginatedBaseRepository;
