export const STYLIST_INVITE_MESSAGES = {
  // Success messages
  INVITE_CREATED: 'Stylist invitation created successfully',
  INVITE_SENT: 'Invitation sent successfully',
  INVITE_VALID: 'Invite is valid',
  INVITE_ACCEPTED: 'Stylist registered. Wait for admin approval.',
  STYLIST_APPROVED: 'Stylist approved successfully',
  STYLIST_REJECTED: 'Stylist rejected successfully',
  USER_BLOCKED: 'User blocked',
  USER_UNBLOCKED: 'User unblocked',
  STYLISTS_LISTED: 'Stylists fetched successfully',

  // Error messages
  EMAIL_ALREADY_REGISTERED: 'Email already registered',
  INVALID_INVITE: 'Invalid or used invite',
  INVITE_EXPIRED: 'Invite expired',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  USER_NOT_FOUND: 'User not found',
  NOT_STYLIST_APPLICANT: 'User is not a stylist applicant',
  STYLIST_ALREADY_INVITED: 'Stylist already invited / accepted / active',
  MISSING_EMAIL: 'Applied stylist must have an email to send invite',
  UPDATE_FAILED: 'Failed to update stylist account. User not found.',
} as const;
