import { injectable, inject } from 'tsyringe';
import { UserModel, UserDocument } from '../../../models/user.model';
import { BaseRepository } from '../../../common/repository/baseRepository';
import { UserEntity } from '../../../common/types/userEntity';
import { IUserRepository, CreateUserInput } from './IUserRepository';
import { UserStatus } from '../../../models/user.model';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { AppError } from '../../../common/errors/appError';
import { PaginatedBaseRepository } from '../../../common/repository/paginatedBaseRepository';
import { TOKENS } from '../../../common/di/tokens';
import { QueryBuilderService } from '../../../common/service/queryBuilder/queryBuilder.service';

@injectable()
export class UserRepository
  extends PaginatedBaseRepository<UserDocument, UserEntity>
  implements IUserRepository
{
  constructor(@inject(TOKENS.QueryBuilder) queryBuilder: QueryBuilderService) {
    super(UserModel, queryBuilder);
  }

  protected getSearchableFields(): readonly (keyof UserDocument & string)[] {
    return ['name', 'email', 'phone'];
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this._model.findOne({ email }).select('+password');
    return user ? this.toEntity(user) : null;
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const user = await this._model.findOne({ phone }).select('+password');
    return user ? this.toEntity(user) : null;
  }

  async findByEmailOrPhone(identifier: string): Promise<UserEntity | null> {
    const user = await this._model
      .findOne({
        $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }],
      })
      .select('+password');

    return user ? this.toEntity(user) : null;
  }

  async createUser(data: CreateUserInput): Promise<UserEntity> {
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

  async markEmailVerified(email: string): Promise<UserEntity | null> {
    const user = await this._model.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { emailVerified: true, isActive: true, status: 'ACTIVE' },
      { new: true },
    );
    return user ? this.toEntity(user) : null;
  }

  async markPhoneVerifiedByPhone(phone: string): Promise<UserEntity | null> {
    const user = await this._model.findOneAndUpdate(
      { phone },
      { phoneVerified: true, isActive: true, status: 'ACTIVE' },
      { new: true },
    );
    return user ? this.toEntity(user) : null;
  }

  // async markPhoneVerified(userId: string, phone: string) {
  //   const exists = await this._model.findOne({
  //     phone,
  //     _id: { $ne: userId },
  //   });

  //   if (exists) {
  //     throw new AppError('Phone number already in use', HttpStatus.BAD_REQUEST);
  //   }

  //   const user = await this._model.findByIdAndUpdate(
  //     userId,
  //     {
  //       phone,
  //       phoneVerified: true,
  //       isActive: true,
  //     },
  //     { new: true },
  //   );

  //   return user ? this.toEntity(user) : null;
  // }

  async activateUser(email: string): Promise<UserEntity | null> {
    const user = await this._model.findOneAndUpdate(
      { email },
      { isActive: true, status: 'ACTIVE' },
      { new: true },
    );
    return user ? this.toEntity(user) : null;
  }

  async updatePassword(email: string, hashedPassword: string): Promise<UserEntity | null> {
    const user = await this._model.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true },
    );
    return user ? this.toEntity(user) : null;
  }
  async createGoogleUser(data: {
    name: string;
    email: string;
    googleId: string;
  }): Promise<UserEntity> {
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

  async updateInvitedStylist(
    userId: string,
    data: { name: string; phone?: string; password: string; isActive: boolean },
  ): Promise<boolean> {
    const updated = await this._model
      .findByIdAndUpdate(
        userId,
        {
          name: data.name,
          phone: data.phone,
          password: data.password,
          isActive: data.isActive,
          phoneVerified: data.phone ? true : false,
          status: 'ACCEPTED',
        },
        { new: true },
      )
      .lean();
    return !!updated;
  }

  async setActiveById(userId: string, isActive: boolean): Promise<void> {
    await this._model.findByIdAndUpdate(userId, { isActive });
  }

  async setBlockedById(userId: string, isBlocked: boolean): Promise<void> {
    console.log(`🔄 Updating user ${userId}: isBlocked = ${isBlocked}`);
    const updated = await this._model.findByIdAndUpdate(userId, { isBlocked });
    console.log(`✅ Updated result:`, updated);
  }

  async setStatusById(userId: string, status: UserStatus): Promise<void> {
    await this._model.findByIdAndUpdate(userId, { status });
  }

  async updateProfilePicture(userId: string, pictureUrl: string): Promise<UserEntity> {
    const user = await this._model.findByIdAndUpdate(
      userId,
      { profilePicture: pictureUrl },
      { new: true },
    );

    if (!user) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND);
    }

    return this.toEntity(user);
  }

  async findAllByRole(role: string): Promise<UserEntity[]> {
    const users = await this._model.find({ role }).sort({ createdAt: -1 }).select('-password -__v');

    return users.map((u) => this.toEntity(u));
  }

  // New methods for profile management
  async findByIdWithPassword(userId: string): Promise<UserEntity | null> {
    const user = await this._model.findById(userId).select('+password');
    return user ? this.toEntity(user) : null;
  }

  async updatePasswordById(userId: string, hashedPassword: string): Promise<UserEntity | null> {
    const user = await this._model.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true },
    );
    return user ? this.toEntity(user) : null;
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string; phone?: string },
  ): Promise<UserEntity | null> {
    const updateData: Record<string, string> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone.trim();

    const user = await this._model.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    return user ? this.toEntity(user) : null;
  }

  protected toEntity(user: UserDocument): UserEntity {
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
}
