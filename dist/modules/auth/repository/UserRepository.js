"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const tsyringe_1 = require("tsyringe");
const user_model_1 = require("../../../models/user.model");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const appError_1 = require("../../../common/errors/appError");
const paginatedBaseRepository_1 = require("../../../common/repository/paginatedBaseRepository");
const tokens_1 = require("../../../common/di/tokens");
const queryBuilder_service_1 = require("../../../common/service/queryBuilder/queryBuilder.service");
let UserRepository = class UserRepository extends paginatedBaseRepository_1.PaginatedBaseRepository {
    constructor(queryBuilder) {
        super(user_model_1.UserModel, queryBuilder);
    }
    getSearchableFields() {
        return ['name', 'email', 'phone'];
    }
    async findByEmail(email) {
        const user = await this._model.findOne({ email }).select('+password');
        return user ? this.toEntity(user) : null;
    }
    async findByPhone(phone) {
        const user = await this._model.findOne({ phone }).select('+password');
        return user ? this.toEntity(user) : null;
    }
    async findByEmailOrPhone(identifier) {
        const user = await this._model
            .findOne({
            $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }],
        })
            .select('+password');
        return user ? this.toEntity(user) : null;
    }
    async createUser(data) {
        const user = new this._model({
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,
            role: data.role || 'USER',
            emailVerified: data.emailVerified ?? false,
            phoneVerified: data.phoneVerified ?? false,
            isActive: data.isActive ?? false,
            isBlocked: false,
            status: data.status ?? (data.role === 'STYLIST' ? 'APPLIED' : 'ACTIVE'),
            authProvider: 'LOCAL',
        });
        await user.save();
        return this.toEntity(user);
    }
    async markEmailVerified(email) {
        const user = await this._model.findOneAndUpdate({ email: email.toLowerCase().trim() }, { emailVerified: true, isActive: true, status: 'ACTIVE' }, { new: true });
        return user ? this.toEntity(user) : null;
    }
    async markPhoneVerifiedByPhone(phone) {
        const user = await this._model.findOneAndUpdate({ phone }, { phoneVerified: true, isActive: true, status: 'ACTIVE' }, { new: true });
        return user ? this.toEntity(user) : null;
    }
    /*
    async markPhoneVerified(userId: string, phone: string) {
      const exists = await this._model.findOne({
        phone,
        _id: { $ne: userId },
      });
  
      if (exists) {
        throw new AppError('Phone number already in use', HttpStatus.BAD_REQUEST);
      }
  
      const user = await this._model.findByIdAndUpdate(
        userId,
        {
          phone,
          phoneVerified: true,
          isActive: true,
        },
        { new: true },
      );
  
      return user ? this.toEntity(user) : null;
    }
    */
    async activateUser(email) {
        const user = await this._model.findOneAndUpdate({ email }, { isActive: true, status: 'ACTIVE' }, { new: true });
        return user ? this.toEntity(user) : null;
    }
    async updatePassword(email, hashedPassword) {
        const user = await this._model.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
        return user ? this.toEntity(user) : null;
    }
    async createGoogleUser(data) {
        const user = new this._model({
            name: data.name,
            email: data.email,
            googleId: data.googleId,
            authProvider: 'GOOGLE',
            role: 'USER',
            emailVerified: true,
            phoneVerified: false,
            status: 'ACTIVE',
            isActive: true,
            isBlocked: false,
        });
        await user.save();
        return this.toEntity(user);
    }
    async updateInvitedStylist(userId, data) {
        const updated = await this._model
            .findByIdAndUpdate(userId, {
            name: data.name,
            phone: data.phone,
            password: data.password,
            isActive: data.isActive,
            phoneVerified: data.phone ? true : false,
            status: 'ACCEPTED',
        }, { new: true })
            .lean();
        return !!updated;
    }
    async getProfile(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new appError_1.AppError('User not found', httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return user;
    }
    async count(filter) {
        return this._model.countDocuments(filter);
    }
    async setActiveById(userId, isActive) {
        await this._model.findByIdAndUpdate(userId, { isActive });
    }
    async setBlockedById(userId, isBlocked) {
        await this._model.findByIdAndUpdate(userId, { isBlocked });
    }
    async setStatusById(userId, status) {
        await this._model.findByIdAndUpdate(userId, { status });
    }
    async updateProfilePicture(userId, pictureUrl) {
        const user = await this._model.findByIdAndUpdate(userId, { profilePicture: pictureUrl }, { new: true });
        if (!user) {
            throw new appError_1.AppError('User not found', httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return this.toEntity(user);
    }
    async findAllByRole(role) {
        const users = await this._model.find({ role }).sort({ createdAt: -1 }).select('-password -__v');
        return users.map((u) => this.toEntity(u));
    }
    async findByIdWithPassword(userId) {
        const user = await this._model.findById(userId).select('+password');
        return user ? this.toEntity(user) : null;
    }
    async updatePasswordById(userId, hashedPassword) {
        const user = await this._model.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
        return user ? this.toEntity(user) : null;
    }
    async updateProfile(userId, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.phone !== undefined)
            updateData.phone = data.phone.trim();
        const user = await this._model.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        });
        return user ? this.toEntity(user) : null;
    }
    toEntity(user) {
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            phone: user.phone,
            phoneVerified: user.phoneVerified,
            password: user.password,
            googleId: user.googleId,
            authProvider: user.authProvider,
            role: user.role,
            isActive: user.isActive,
            isBlocked: user.isBlocked,
            status: user.status,
            profilePicture: user.profilePicture ?? null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.QueryBuilder)),
    __metadata("design:paramtypes", [queryBuilder_service_1.QueryBuilderService])
], UserRepository);
