export const BOOKING_MESSAGES = {
  CREATED: 'Booking created successfully',
  CANCELLED: 'Booking cancelled successfully',
  UNAUTHORIZED: 'Unauthorized',
  FETCHED: 'Booking details fetched',
  LISTED: 'Bookings fetched successfully',
  NOT_FOUND: 'Booking not found',
  UNAUTHORIZED_CANCEL: 'You are not authorized to cancel this booking',
  ALREADY_CANCELLED: 'Booking is already cancelled',
  ALREADY_BOOKED: 'This slot is already booked',

  STATUS_UPDATED: 'Booking status updated successfully',
  RESCHEDULED: 'Booking rescheduled successfully',
  NO_SERVICES: 'No services selected for booking',
  CANCEL_LEAD_TIME: 'Bookings can only be cancelled at least 12 hours before the appointment.',
  CANCEL_FAILED: 'Failed to cancel booking',

  RESCHEDULE_CUSTOMER_ONLY: 'You are not authorized to reschedule this booking',
  RESCHEDULE_ONCE_ONLY: 'Booking can only be rescheduled once.',
  RESCHEDULE_LEAD_TIME: 'Rescheduling must be done at least 12 hours in advance.',
  RESCHEDULE_FAILED: 'Failed to reschedule booking',
  SERVICES_NOT_AVAILABLE: 'One or more services are not available',

  // Dynamic message factories
  SERVICE_NOT_FOUND: (serviceId: string) => `Service ${serviceId} not found`,
  SLOT_UNAVAILABLE: (serviceId: string) => `Slot for ${serviceId} is unavailable`,
  SLOT_UNAVAILABLE_AT: (time: string) => `Slot at ${time} is no longer available`,

  // Validator messages
  MODIFIED_CANCELLED: 'Cannot change status of a cancelled booking',
  STATUS_FORBIDDEN: 'Users can only cancel their bookings',
  LEAD_TIME_VIOLATION: 'Cannot modify booking within 2 hours of its start time',
  TOO_EARLY_FOR_STATUS: 'Status update can only be performed after the booking start time',
  STATUS_FORBIDDEN_STYLIST: 'Stylists can only update status to START, NO-SHOW, or COMPLETED',
  WRONG_DAY_FOR_STATUS: 'Status updates can only be performed on the day of the booking',
};
