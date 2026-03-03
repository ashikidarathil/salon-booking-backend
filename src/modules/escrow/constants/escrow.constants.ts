import { EscrowStatus } from '../../../models/escrow.model';

export { EscrowStatus };

export const ESCROW_CONSTANTS = {
  ADVANCE_PERCENTAGE: 40,
};

export const ESCROW_MESSAGES = {
  HELD_SUCCESS: 'Amount held in escrow successfully',
  RELEASE_SUCCESS: 'Amount released from escrow successfully',
  REFUND_SUCCESS: 'Amount refunded from escrow successfully',
  ERROR: {
    NOT_FOUND: 'Escrow record not found',
    INVALID_STATUS: 'Invalid escrow status for this operation',
    ALREADY_RELEASED: 'Escrow amount already released',
    ALREADY_REFUNDED: 'Escrow amount already refunded',
  },
};
