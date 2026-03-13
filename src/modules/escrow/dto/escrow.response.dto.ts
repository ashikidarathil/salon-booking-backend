import { EscrowStatus } from '../../../models/escrow.model';

export interface EscrowResponseDto {
  id: string;
  bookingId: {
    id: string;
    bookingNumber: string;
    userId?: {
      name: string;
    };
    items?: Array<{
      serviceId: {
        name: string;
      };
    }>;
  };
  stylistId: {
    id: string;
    userId: {
      name: string;
    };
  };
  amount: number;
  status: EscrowStatus;
  releaseMonth: string;
  createdAt: string;
}
