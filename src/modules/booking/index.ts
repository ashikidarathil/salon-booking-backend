import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { BookingRepository } from './repository/booking.repository';

import { IBookingService } from './service/IBookingService';
import { BookingService } from './service/booking.service';
import { BookingValidator } from './service/BookingValidator';
import { BookingQueryService } from './service/BookingQueryService';

import { BookingController } from './controller/booking.controller';

container.register(TOKENS.BookingRepository, {
  useClass: BookingRepository,
});

container.register(TOKENS.BookingValidator, {
  useClass: BookingValidator,
});

container.register(TOKENS.BookingQueryService, {
  useClass: BookingQueryService,
});

container.register<IBookingService>(TOKENS.BookingService, {
  useClass: BookingService,
});

container.register(BookingController, {
  useClass: BookingController,
});

export const resolveBookingController = () => container.resolve(BookingController);
