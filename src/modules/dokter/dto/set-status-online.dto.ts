import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetStatusOnlineDto {
  @ApiProperty({ example: true, description: 'true = online/siap menerima chat, false = offline' })
  @IsBoolean()
  statusOnline!: boolean;
}