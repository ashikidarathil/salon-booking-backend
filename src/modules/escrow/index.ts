import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { EscrowRepository } from './repository/escrow.repository';
import { EscrowService } from './service/escrow.service';
import { EscrowController } from './controller/escrow.controller';

// Register Repositories
container.register(TOKENS.EscrowRepository, { useClass: EscrowRepository });

// Register Services
container.register(TOKENS.EscrowService, { useClass: EscrowService });

// Register Controllers
container.register(TOKENS.EscrowController, { useClass: EscrowController });
