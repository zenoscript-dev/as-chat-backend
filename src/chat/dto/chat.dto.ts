import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ChatStatus } from '../enum/chatStatus.enum';

export class MessageStructure {
  @IsString()
  senderId: string;

  @IsString()
  recipientId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(ChatStatus)
  status?: ChatStatus;
}
