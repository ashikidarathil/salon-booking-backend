import { IEscrow, EscrowStatus } from '../../../models/escrow.model';
import { ClientSession, PopulateOptions } from 'mongoose';
import { SortOptions } from '../../../common/repository/baseRepository';

export interface IEscrowRepository {
  create(data: Partial<IEscrow>, session?: ClientSession): Promise<IEscrow>;
  findById(id: string): Promise<IEscrow | null>;
  findByBookingId(bookingId: string): Promise<IEscrow | null>;
  updateStatus(id: string, status: EscrowStatus, session?: ClientSession): Promise<IEscrow | null>;
  find(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
    sort?: SortOptions,
  ): Promise<IEscrow[]>;
}
