"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistRepository = void 0;
const tsyringe_1 = require("tsyringe");
const stylist_model_1 = require("../../../models/stylist.model");
const user_model_1 = require("../../../models/user.model");
const stylistInvite_model_1 = require("../../../models/stylistInvite.model");
const stylistBranch_model_1 = require("../../../models/stylistBranch.model");
const stylistService_model_1 = require("../../../models/stylistService.model");
const branchService_model_1 = require("../../../models/branchService.model");
const branch_model_1 = require("../../../models/branch.model");
const service_model_1 = require("../../../models/service.model");
const category_model_1 = require("../../../models/category.model");
const branchCategory_model_1 = require("../../../models/branchCategory.model");
const stylistWeeklySchedule_model_1 = require("../../../models/stylistWeeklySchedule.model");
const pagination_query_dto_1 = require("../../../common/dto/pagination.query.dto");
const pagination_response_dto_1 = require("../../../common/dto/pagination.response.dto");
let StylistRepository = class StylistRepository {
    mapDocToListItem(stylist, user, invite, branchName, assignedServices, assignedServiceDetails, weeklySchedule) {
        return {
            id: stylist._id.toString(),
            userId: stylist.userId.toString(),
            name: user?.name ?? 'Pending Registration',
            email: user?.email,
            phone: user?.phone,
            specialization: stylist.specialization,
            experience: stylist.experience,
            status: stylist.status,
            userStatus: (user?.status ?? 'ACTIVE'),
            isBlocked: !!user?.isBlocked,
            inviteStatus: invite?.status,
            inviteExpiresAt: invite?.expiresAt?.toISOString(),
            inviteLink: invite?.inviteLink,
            position: stylist.position,
            bio: stylist.bio,
            profilePicture: user?.profilePicture || stylist.profilePicture || undefined,
            branchName: branchName || 'N/A',
            assignedServices: assignedServices || [],
            assignedServiceDetails: assignedServiceDetails,
            weeklySchedule,
            rating: stylist.rating || 0,
            reviewCount: stylist.reviewCount || 0,
        };
    }
    async existsByUserId(userId) {
        const stylist = await stylist_model_1.StylistModel.findOne({ userId }).select('_id').lean();
        return !!stylist;
    }
    async createStylistDraft(data) {
        await stylist_model_1.StylistModel.create({
            userId: data.userId,
            specialization: data.specialization,
            experience: data.experience,
            status: 'INACTIVE',
        });
    }
    async activateByUserId(userId) {
        await stylist_model_1.StylistModel.findOneAndUpdate({ userId }, { status: 'ACTIVE' });
    }
    async listAll() {
        const stylists = await stylist_model_1.StylistModel.find().sort({ createdAt: -1 }).lean();
        if (stylists.length === 0)
            return [];
        const userIds = stylists.map((s) => s.userId);
        const users = await user_model_1.UserModel.find({ _id: { $in: userIds } })
            .select('name email phone isActive isBlocked status')
            .lean();
        const userMap = new Map();
        users.forEach((u) => userMap.set(u._id.toString(), u));
        const invites = await stylistInvite_model_1.StylistInviteModel.find({
            userId: { $in: userIds },
            status: 'PENDING',
        })
            .sort({ createdAt: -1 })
            .lean();
        const inviteMap = new Map();
        invites.forEach((inv) => {
            const uid = inv.userId.toString();
            if (!inviteMap.has(uid)) {
                inviteMap.set(uid, inv);
            }
        });
        return stylists.map((s) => {
            const user = userMap.get(s.userId.toString());
            const invite = inviteMap.get(s.userId.toString());
            return this.mapDocToListItem(s, user, invite);
        });
    }
    async getDraftByUserId(userId) {
        const doc = await stylist_model_1.StylistModel.findOne({ userId }).select(' specialization experience').lean();
        if (!doc)
            return null;
        return {
            specialization: doc.specialization,
            experience: doc.experience,
        };
    }
    async getPaginatedStylists(query) {
        const { params, search, sort, filters } = pagination_query_dto_1.PaginationQueryParser.parse(query);
        const finalQuery = {};
        let filteredUserIds = null;
        if (filters.status) {
            finalQuery.status = filters.status;
        }
        if (typeof filters.isBlocked === 'boolean') {
            const users = await user_model_1.UserModel.find({ isBlocked: filters.isBlocked })
                .select('_id')
                .lean();
            filteredUserIds = users.map((u) => u._id.toString());
        }
        if (typeof filters.isActive === 'boolean') {
            const users = await user_model_1.UserModel.find({ isActive: filters.isActive })
                .select('_id')
                .lean();
            const activeUserIds = users.map((u) => u._id.toString());
            filteredUserIds = filteredUserIds
                ? filteredUserIds.filter((id) => activeUserIds.includes(id))
                : activeUserIds;
        }
        if (filters.position) {
            finalQuery.position = filters.position;
        }
        if (filters.branchId) {
            const branchStylists = await stylistBranch_model_1.StylistBranchModel.find({
                branchId: filters.branchId,
                isActive: true,
            })
                .select('stylistId')
                .lean();
            const stylistIdsInBranch = branchStylists.map((bs) => bs.stylistId.toString());
            finalQuery._id = { $in: stylistIdsInBranch };
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            const matchedUsers = await user_model_1.UserModel.find({
                $or: [{ name: regex }, { email: regex }, { phone: regex }],
            })
                .select('_id')
                .lean();
            const searchUserIds = matchedUsers.map((u) => u._id.toString());
            const orConditions = [{ specialization: regex }];
            if (searchUserIds.length > 0) {
                orConditions.push({ userId: { $in: searchUserIds } });
            }
            finalQuery.$or = orConditions;
        }
        if (filteredUserIds) {
            finalQuery.userId = { $in: filteredUserIds };
        }
        const [stylists, totalItems] = await Promise.all([
            stylist_model_1.StylistModel.find(finalQuery).sort(sort).skip(params.skip).limit(params.limit).lean(),
            stylist_model_1.StylistModel.countDocuments(finalQuery),
        ]);
        if (stylists.length === 0) {
            return pagination_response_dto_1.PaginationResponseBuilder.build([], totalItems, params.page, params.limit);
        }
        const userIds = stylists.map((s) => s.userId);
        const stylistIds = stylists.map((s) => s._id);
        const [users, invites, branches, stylistServices] = await Promise.all([
            user_model_1.UserModel.find({ _id: { $in: userIds } })
                .select('name email phone isBlocked status profilePicture')
                .lean(),
            stylistInvite_model_1.StylistInviteModel.find({ userId: { $in: userIds } }).lean(),
            stylistBranch_model_1.StylistBranchModel.find({ stylistId: { $in: stylistIds }, isActive: true })
                .populate({ path: 'branchId', model: branch_model_1.BranchModel, select: 'name' })
                .lean(),
            stylistService_model_1.StylistServiceModel.find({ stylistId: { $in: stylistIds }, isActive: { $ne: false } })
                .populate({
                path: 'serviceId',
                model: service_model_1.ServiceModel,
                select: 'name categoryId status isDeleted',
            })
                .lean(),
        ]);
        const userMap = new Map();
        users.forEach((u) => userMap.set(u._id.toString(), u));
        const inviteMap = new Map();
        invites.forEach((i) => {
            const uid = i.userId.toString();
            if (!inviteMap.has(uid)) {
                inviteMap.set(uid, i);
            }
        });
        const allCategoryIds = [
            ...new Set(stylistServices
                .map((ss) => ss.serviceId?.categoryId?.toString())
                .filter(Boolean)),
        ];
        const branchIds = [
            ...new Set(branches.map((b) => b.branchId?._id?.toString() || b.branchId?.toString()).filter(Boolean)),
        ];
        const branchNameMap = new Map();
        branches.forEach((b) => {
            const sid = b.stylistId.toString();
            if (b.branchId?.name) {
                branchNameMap.set(sid, b.branchId.name);
            }
        });
        const stylistToBranchIdMap = new Map();
        branches.forEach((b) => {
            const sid = b.stylistId.toString();
            const bid = b.branchId?._id?.toString() || b.branchId?.toString();
            if (bid)
                stylistToBranchIdMap.set(sid, bid);
        });
        const [categories, branchCategories, branchServices] = await Promise.all([
            allCategoryIds.length > 0
                ? category_model_1.CategoryModel.find({
                    _id: { $in: allCategoryIds },
                    status: { $ne: 'INACTIVE' },
                    isDeleted: { $ne: true },
                }).lean()
                : Promise.resolve([]),
            branchIds.length > 0 && allCategoryIds.length > 0
                ? branchCategory_model_1.BranchCategoryModel.find({
                    branchId: { $in: branchIds },
                    categoryId: { $in: allCategoryIds },
                    isActive: { $ne: false },
                }).lean()
                : Promise.resolve([]),
            branchIds.length > 0
                ? branchService_model_1.BranchServiceModel.find({ branchId: { $in: branchIds }, isActive: { $ne: false } }).lean()
                : Promise.resolve([]),
        ]);
        const activeGlobalCategoryIds = new Set(categories.map((c) => c._id.toString()));
        const branchCategoryMap = new Set();
        branchCategories.forEach((bc) => {
            branchCategoryMap.add(`${bc.branchId.toString()}:${bc.categoryId.toString()}`);
        });
        const branchServiceMap = new Set();
        branchServices.forEach((bs) => {
            branchServiceMap.add(`${bs.branchId.toString()}:${bs.serviceId.toString()}`);
        });
        const servicesMap = new Map();
        stylistServices.forEach((ss) => {
            const service = ss.serviceId;
            if (!service || service.status === 'INACTIVE' || service.isDeleted === true)
                return;
            const sid = ss.stylistId.toString();
            const branchId = stylistToBranchIdMap.get(sid);
            if (!branchId)
                return;
            const catId = service.categoryId?.toString();
            if (!catId || !activeGlobalCategoryIds.has(catId))
                return;
            if (!branchCategoryMap.has(`${branchId}:${catId}`))
                return;
            if (!branchServiceMap.has(`${branchId}:${service._id.toString()}`))
                return;
            const existing = servicesMap.get(sid) || [];
            if (existing.length < 3) {
                existing.push(service.name);
                servicesMap.set(sid, existing);
            }
        });
        const result = stylists.map((s) => {
            const user = userMap.get(s.userId.toString());
            const invite = inviteMap.get(s.userId.toString());
            const sid = s._id.toString();
            return this.mapDocToListItem(s, user, invite, branchNameMap.get(sid), servicesMap.get(sid));
        });
        return pagination_response_dto_1.PaginationResponseBuilder.build(result, totalItems, params.page, params.limit);
    }
    async setBlockedById(stylistId, isBlocked) {
        const stylist = await stylist_model_1.StylistModel.findById(stylistId).lean();
        if (!stylist) {
            return null;
        }
        const user = await user_model_1.UserModel.findByIdAndUpdate(stylist.userId, { isBlocked }, { new: true })
            .select('name email phone isBlocked status profilePicture')
            .lean();
        if (!user) {
            return null;
        }
        return this.mapDocToListItem(stylist, user ?? undefined);
    }
    async updatePosition(stylistId, position) {
        const stylist = await stylist_model_1.StylistModel.findByIdAndUpdate(stylistId, { position }, { new: true }).lean();
        if (!stylist)
            return null;
        const user = await user_model_1.UserModel.findById(stylist.userId)
            .select('name email phone isBlocked status profilePicture')
            .lean();
        return this.mapDocToListItem(stylist, user ?? undefined);
    }
    async getById(stylistId) {
        const stylist = await stylist_model_1.StylistModel.findById(stylistId).lean();
        if (!stylist)
            return null;
        const user = await user_model_1.UserModel.findById(stylist.userId)
            .select('name email phone isBlocked status profilePicture')
            .lean();
        // 1. Fetch the active branch association first
        const stylistBranch = await stylistBranch_model_1.StylistBranchModel.findOne({
            stylistId: stylist._id,
            isActive: { $ne: false },
        })
            .populate({ path: 'branchId', model: branch_model_1.BranchModel, select: 'name' })
            .lean();
        const branchDoc = stylistBranch?.branchId;
        const branchIdStr = branchDoc?._id?.toString() || branchDoc;
        const branchName = branchDoc?.name || (branchIdStr ? 'N/A' : null);
        const [schedules, stylistServices] = await Promise.all([
            stylistWeeklySchedule_model_1.StylistWeeklyScheduleModel.find({
                stylistId: stylist._id,
                ...(branchIdStr && { branchId: branchIdStr }),
            }).lean(),
            stylistService_model_1.StylistServiceModel.find({ stylistId: stylist._id, isActive: { $ne: false } })
                .populate({
                path: 'serviceId',
                model: service_model_1.ServiceModel,
                select: 'name imageUrl categoryId status isDeleted',
            })
                .lean(),
        ]);
        const serviceIds = stylistServices.map((ss) => ss.serviceId?._id).filter(Boolean);
        const branchServicesResult = branchIdStr
            ? await branchService_model_1.BranchServiceModel.find({
                branchId: branchIdStr,
                serviceId: { $in: serviceIds },
                isActive: { $ne: false },
            }).lean()
            : [];
        const branchServiceMap = new Map();
        branchServicesResult.forEach((bs) => {
            const b = bs;
            branchServiceMap.set(b.serviceId.toString(), b);
        });
        // 4. Fetch BranchCategory activity for all unique categories in those services
        const uniqueCategoryIds = [
            ...new Set(stylistServices
                .map((ss) => ss.serviceId?.categoryId?.toString())
                .filter(Boolean)),
        ];
        const [categories, branchCategories] = await Promise.all([
            uniqueCategoryIds.length > 0
                ? category_model_1.CategoryModel.find({
                    _id: { $in: uniqueCategoryIds },
                    status: { $ne: 'INACTIVE' },
                    isDeleted: { $ne: true },
                }).lean()
                : Promise.resolve([]),
            branchIdStr && uniqueCategoryIds.length > 0
                ? branchCategory_model_1.BranchCategoryModel.find({
                    branchId: branchIdStr,
                    categoryId: { $in: uniqueCategoryIds },
                    isActive: { $ne: false },
                }).lean()
                : Promise.resolve([]),
        ]);
        const activeCategoryIds = new Set(categories.map((c) => c._id.toString()));
        const activeBranchCategoryIds = new Set(branchCategories.map((bc) => bc.categoryId.toString()));
        // Map schedules to IWeeklyScheduleItem
        const weeklySchedule = schedules.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            isWorkingDay: s.isWorkingDay,
            shifts: (s.shifts || []).map((shift) => ({
                startTime: shift.startTime,
                endTime: shift.endTime,
            })),
        }));
        const assignedServiceDetails = stylistServices
            .map((ss) => {
            const service = ss.serviceId;
            if (!service || service.status === 'INACTIVE' || service.isDeleted === true)
                return null;
            const catId = service.categoryId?.toString();
            if (branchIdStr) {
                if (!catId || !activeCategoryIds.has(catId) || !activeBranchCategoryIds.has(catId)) {
                    return null;
                }
                const bs = branchServiceMap.get(service._id.toString());
                if (!bs || bs.isActive === false)
                    return null;
                return {
                    id: service._id.toString(),
                    name: service.name,
                    price: bs.price,
                    duration: bs.duration,
                    imageUrl: service.imageUrl,
                };
            }
            return null;
        })
            .filter(Boolean);
        const assignedServices = assignedServiceDetails.map((s) => s.name);
        return this.mapDocToListItem(stylist, user ?? undefined, undefined, branchName || undefined, assignedServices, assignedServiceDetails, weeklySchedule);
    }
    async findByUserId(userId) {
        const stylist = await stylist_model_1.StylistModel.findOne({ userId }).select('_id').lean();
        if (!stylist)
            return null;
        return this.getById(stylist._id.toString());
    }
    async findIdByUserId(userId) {
        const stylist = await stylist_model_1.StylistModel.findOne({ userId }).select('_id').lean();
        return stylist?._id?.toString() || null;
    }
    async updateByUserId(userId, data) {
        const updateData = {};
        if (data.bio !== undefined)
            updateData.bio = data.bio;
        if (data.specialization !== undefined)
            updateData.specialization = data.specialization;
        if (data.experience !== undefined)
            updateData.experience = data.experience;
        if (data.position !== undefined)
            updateData.position = data.position;
        if (Object.keys(updateData).length > 0) {
            await stylist_model_1.StylistModel.findOneAndUpdate({ userId }, updateData);
        }
    }
    async update(id, data) {
        await stylist_model_1.StylistModel.findByIdAndUpdate(id, data);
    }
};
exports.StylistRepository = StylistRepository;
exports.StylistRepository = StylistRepository = __decorate([
    (0, tsyringe_1.injectable)()
], StylistRepository);
