"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchRepository = void 0;
const branch_model_1 = require("../../../models/branch.model");
const pagination_query_dto_1 = require("../../../common/dto/pagination.query.dto");
const pagination_response_dto_1 = require("../../../common/dto/pagination.response.dto");
const branch_mapper_1 = require("../mapper/branch.mapper");
class BranchRepository {
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }
    create(data) {
        return branch_model_1.BranchModel.create({
            ...data,
            isDeleted: false,
        });
    }
    findAll(includeDeleted = false) {
        if (includeDeleted) {
            return branch_model_1.BranchModel.find().sort({ createdAt: -1 });
        }
        return branch_model_1.BranchModel.find({
            $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
        }).sort({ createdAt: -1 });
    }
    findById(id) {
        return branch_model_1.BranchModel.findById(id);
    }
    update(id, data) {
        return branch_model_1.BranchModel.findByIdAndUpdate(id, data, { new: true });
    }
    disable(id) {
        return branch_model_1.BranchModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
    restore(id) {
        return branch_model_1.BranchModel.findByIdAndUpdate(id, { isDeleted: false }, { new: true });
    }
    async getPaginatedBranches(query) {
        const { params, search, sort, filters } = pagination_query_dto_1.PaginationQueryParser.parse(query);
        const finalQuery = {};
        if (typeof filters.isDeleted === 'boolean') {
            finalQuery.isDeleted = filters.isDeleted;
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            finalQuery.$or = [{ name: regex }, { address: regex }, { phone: regex }];
        }
        const [branches, totalItems] = await Promise.all([
            branch_model_1.BranchModel.find(finalQuery).sort(sort).skip(params.skip).limit(params.limit).lean(),
            branch_model_1.BranchModel.countDocuments(finalQuery),
        ]);
        if (branches.length === 0) {
            return pagination_response_dto_1.PaginationResponseBuilder.build([], totalItems, params.page, params.limit);
        }
        const result = branches.map((branch) => branch_mapper_1.BranchMapper.toResponse(branch));
        return pagination_response_dto_1.PaginationResponseBuilder.build(result, totalItems, params.page, params.limit);
    }
    async findNearestBranches(latitude, longitude, maxDistance = 5000000) {
        if (latitude < -90 || latitude > 90) {
            throw new Error('Invalid latitude');
        }
        if (longitude < -180 || longitude > 180) {
            throw new Error('Invalid longitude');
        }
        const branches = await branch_model_1.BranchModel.find({
            isDeleted: false,
        }).lean();
        const branchesWithDistance = branches
            .map((branch) => {
            const distance = this.calculateDistance(latitude, longitude, branch.latitude, branch.longitude);
            if (distance > maxDistance) {
                return null;
            }
            return {
                ...branch_mapper_1.BranchMapper.toResponse(branch, distance),
                distance,
            };
        })
            .filter((branch) => branch !== null);
        branchesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        console.log(`✅ Found ${branchesWithDistance.length} nearby branches`);
        return branchesWithDistance;
    }
}
exports.BranchRepository = BranchRepository;
