import { injectable } from 'tsyringe';
import { UserModel, UserDocument } from '../../../models/User.model';
import { BaseRepository } from '../../../common/repository/BaseRepository';
import { UserEntity } from '../../../types/UserEntity';
import { IUserRepository, CreateUserInput } from './IUserRepository';

@injectable()
export class UserRepository
  extends BaseRepository<UserDocument, UserEntity>
  implements IUserRepository
{
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this._model.findOne({ email }).select('+password');
    return user ? this.toEntity(user) : null;
  }

  async createUser(data: CreateUserInput): Promise<UserEntity> {
    const user = new this._model(data);
    await user.save();
    return this.toEntity(user);
  }

  async activateUser(email: string): Promise<UserEntity | null> {
    const user = await this._model.findOneAndUpdate({ email }, { isActive: true }, { new: true });
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

  protected toEntity(user: UserDocument): UserEntity {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
