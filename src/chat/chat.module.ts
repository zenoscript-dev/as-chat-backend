import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [ChatGateway, JwtService],
})
export class ChatModule {}
