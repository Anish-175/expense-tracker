import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { WalletType } from '../entities/wallet.entity';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(WalletType)
  @IsOptional()
  type?: WalletType = WalletType.WALLET;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  initial_balance?: number = 0;
}
