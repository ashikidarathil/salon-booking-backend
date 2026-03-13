import { StylistWalletResponseDto } from '../dto/stylistWallet.dto';

export interface IStylistWalletService {
  getWallet(stylistId: string): Promise<StylistWalletResponseDto>;
  addEarnings(stylistId: string, amount: number): Promise<void>;
}
