import { StylistServiceDocument, StylistServiceModel } from '../../../models/stylistService.model';
import { IStylistServiceRepository } from './IStylistServiceRepository';
import { BaseRepository } from '../../../common/repository/baseRepository';
import { injectable } from 'tsyringe';
import { toObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class StylistServiceRepository
  extends BaseRepository<StylistServiceDocument, StylistServiceDocument>
  implements IStylistServiceRepository
{
  constructor() {
    super(StylistServiceModel);
  }

  protected toEntity(doc: StylistServiceDocument): StylistServiceDocument {
    return doc;
  }

  async findByStylistId(stylistId: string) {
    return StylistServiceModel.find({ stylistId: toObjectId(stylistId) }).sort({ createdAt: -1 });
  }

  async findByServiceId(serviceId: string) {
    return StylistServiceModel.find({ serviceId: toObjectId(serviceId), isActive: true })
      .populate({
        path: 'stylistId',
        populate: { path: 'userId', select: 'name' },
      })
      .lean<StylistServiceDocument[]>();
  }

  async toggleStatus(stylistId: string, serviceId: string, isActive: boolean, updatedBy: string) {
    return StylistServiceModel.findOneAndUpdate(
      { stylistId: toObjectId(stylistId), serviceId: toObjectId(serviceId) },
      { isActive, updatedBy: toObjectId(updatedBy) },
      { new: true, upsert: true },
    );
  }
}
