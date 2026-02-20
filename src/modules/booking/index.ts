import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import { IBookingRepository } from './repository/IBookingRepository';
import { BookingRepository } from './repository/booking.repository';

import { IBookingService } from './service/IBookingService';
import { BookingService } from './service/booking.service';

import { BookingController } from './controller/booking.controller';

container.register<IBookingRepository>(TOKENS.BookingRepository, {
  useClass: BookingRepository,
});

container.register<IBookingService>(TOKENS.BookingService, {
  useClass: BookingService,
});

container.register(BookingController, {
  useClass: BookingController,
});

export const resolveBookingController = () => container.resolve(BookingController);
