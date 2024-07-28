import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [ChatGateway, JwtService],
})
export class ChatModule {}
