import { StylistWalletResponseDto } from '../dto/stylistWallet.response.dto';

export interface IStylistWalletService {
  getWallet(stylistId: string): Promise<StylistWalletResponseDto>;
  addEarnings(stylistId: string, amount: number): Promise<void>;
}
