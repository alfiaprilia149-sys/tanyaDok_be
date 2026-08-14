import { IsBoolean } from 'class-validator';

export class SetStatusOnlineDto {
  @IsBoolean()
  statusOnline!: boolean;
}