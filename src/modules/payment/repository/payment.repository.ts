import { BaseRepository } from '../../../common/repository/baseRepository';
import { IPayment, PaymentModel } from '../../../models/payment.model';
import { IPaymentRepository } from './IPaymentRepository';
import { injectable } from 'tsyringe';
import { ClientSession, UpdateQuery } from 'mongoose';
import { toObjectId, ObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class PaymentRepository
  extends BaseRepository<IPayment, IPayment>
  implements IPaymentRepository
{
  constructor() {
    super(PaymentModel);
  }

  protected toEntity(doc: IPayment): IPayment {
    return doc;
  }

  async findByOrderId(orderId: string): Promise<IPayment | null> {
    return this.findOne({ orderId, isDeleted: false });
  }

  async softDelete(id: string, session?: ClientSession): Promise<boolean> {
    const result = await this.update(toObjectId(id).toString(), { isDeleted: true } as UpdateQuery<IPayment>, session);
    return !!result;
  }

  override async findById(id: string): Promise<IPayment | null> {
    return this.findOne({ _id: id, isDeleted: false });
  }

  override async find(filter: Record<string, unknown>): Promise<IPayment[]> {
    return super.find({ ...filter, isDeleted: false });
  }
}
