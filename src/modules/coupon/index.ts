import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { CouponRepository } from './repository/coupon.repository';
import { CouponService } from './service/coupon.service';
import { CouponController } from './controller/coupon.controller';
import { ICouponController } from './controller/ICouponController';

container.register(TOKENS.CouponRepository, { useClass: CouponRepository });
container.register(TOKENS.CouponService, { useClass: CouponService });
container.register(TOKENS.CouponController, { useClass: CouponController });

export const resolveCouponController = (): ICouponController => {
  return container.resolve<ICouponController>(TOKENS.CouponController);
};
