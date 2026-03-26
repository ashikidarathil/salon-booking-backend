import { ObjectId } from '../../../common/utils/mongoose.util';

/**
 * Typed interfaces for populated mongoose references in the Chat Module
 * These avoid 'any' when working with populated documents
 */

export interface PopulatedUserRef {
  _id?: string | ObjectId;
  name?: string;
  profilePicture?: string;
}

export interface PopulatedStylistRef {
  _id?: string | ObjectId;
  userId?: PopulatedUserRef;
  profilePicture?: string;
}

export interface PopulatedBookingRef {
  _id?: string | ObjectId;
  bookingNumber?: string;
  status?: string;
  completedAt?: Date;
  cancelledAt?: Date;
}

export interface PopulatedBookingMessageRef {
  bookingNumber?: string;
  status?: string;
  items?: { serviceId?: { name?: string } }[];
}

export interface PopulatedBookingExpiry {
  status?: string;
  completedAt?: Date;
  cancelledAt?: Date;
}

export interface PopulatedStylistWithUser {
  userId?: ObjectId | string;
}
