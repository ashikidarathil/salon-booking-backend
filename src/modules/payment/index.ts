import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { PaymentRepository } from './repository/payment.repository';
import { RazorpayService } from './service/razorpay.service';
import { PaymentService } from './service/payment.service';
import { PaymentController } from './controller/payment.controller';
import { IPaymentController } from './controller/IPaymentController';

// Register Repositories
container.registerSingleton(TOKENS.PaymentRepository, PaymentRepository);

// Register Services
container.registerSingleton(TOKENS.RazorpayService, RazorpayService);
container.registerSingleton(TOKENS.PaymentService, PaymentService);

// Register Controllers
container.registerSingleton(TOKENS.PaymentController, PaymentController);

export function resolvePaymentController(): IPaymentController {
  return container.resolve<IPaymentController>(TOKENS.PaymentController);
}
