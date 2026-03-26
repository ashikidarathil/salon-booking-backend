import { IPayment } from '../../../models/payment.model';
import { ClientSession, UpdateQuery } from 'mongoose';
import { PopulateOptions } from '../../../common/utils/mongoose.util';
import { SortOptions } from '../../../common/repository/baseRepository';

export interface IPaymentRepository {
  findById(id: string): Promise<IPayment | null>;
  find(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
    sort?: SortOptions,
  ): Promise<IPayment[]>;
  create(data: Partial<IPayment>, session?: ClientSession): Promise<IPayment>;
  update(
    id: string,
    data: UpdateQuery<IPayment>,
    session?: ClientSession,
  ): Promise<IPayment | null>;
  softDelete(id: string, session?: ClientSession): Promise<boolean>;
  findByOrderId(orderId: string): Promise<IPayment | null>;
}
