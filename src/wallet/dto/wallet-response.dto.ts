import { Expose } from 'class-transformer';
import { WalletType } from '../entities/wallet.entity';

export class WalletResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  type: WalletType

  @Expose()
  initial_balance: number;

  @Expose()
  created_at: Date;
}
