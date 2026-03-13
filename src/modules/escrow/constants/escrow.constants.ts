import { EscrowStatus } from '../../../models/escrow.model';

export { EscrowStatus };

export const ESCROW_MESSAGES = {
  HELD_SUCCESS: 'Amount held in escrow successfully',
  RELEASE_SUCCESS: 'Amount released from escrow successfully',
  FETCHED_ALL: 'Escrow records fetched successfully',
  FETCHED_ONE: 'Escrow record fetched successfully',
  LOGS: {
    MONTHLY_RELEASE_START: (month: string) =>
      `[Escrow] Starting monthly release for month < ${month}`,
    MONTHLY_RELEASE_FOUND: (count: number) =>
      `[Escrow] Found ${count} escrows due for monthly release`,
    ATTEMPTING_RELEASE: (bookingId: string | object) =>
      `[Escrow] Attempting to release escrow for booking ${String(bookingId)}`,
    SUCCESS_RELEASE: (bookingId: string | object) =>
      `[Escrow] Successfully released escrow for booking ${String(bookingId)}`,
    FAIL_RELEASE: (bookingId: string | object, error: string) =>
      `[Escrow] Failed to release escrow for booking ${String(bookingId)}: ${error}`,
  },
  ERROR: {
    NOT_FOUND: 'Escrow record not found',
    INVALID_STATUS: 'Invalid escrow status for this operation',
    ALREADY_RELEASED: 'Escrow amount already released',
    UPDATE_FAILED: 'Failed to update escrow record',
    ALREADY_EXISTS: 'Escrow already exists for this booking',
  },
};
