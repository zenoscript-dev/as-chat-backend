import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway(3200, { cors: { origin: '*' } })
@ApiBearerAuth('JWT-auth')
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private users: { id: number; clientId: string }[] = [];

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string; // Extract token from query parameter

    if (!token) {
      client.emit('error', { message: 'No token provided. Please log in.' });
      client.disconnect();
      return; // Gracefully handle disconnection
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // Check if user exists and update their chatid
      const user = await this.userRepository.findOneBy({ id: decoded.userId });
      if (!user) {
        client.emit('error', { message: 'User not found.' });
        client.disconnect();
        return;
      }

      user.chatid = client.id;

      await this.userRepository.save(user);
    } catch (error) {
      console.error('Error handling connection:', error.message);
      client.emit('error', { message: 'Invalid token. Please log in again.' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      // Find the user with the disconnected chatid
      const user = await this.userRepository.findOneBy({ chatid: client.id });
      if (user) {
        // Clear the chatid for the user
        await this.userRepository.update({ id: user.id }, { chatid: null });
      }

      // Remove the user from the connected users list
      this.users = this.users.filter((user) => user.clientId !== client.id);
    } catch (error) {
      console.error('Error handling disconnect:', error.message);
    }
  }

  @SubscribeMessage('one-one-message')
  async handleNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: any,
  ) {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.recieverId) {
        console.log(this.users);
        const receiver = await this.userRepository.findOneBy({
          id: parsedMessage.recieverId,
        });

        if (receiver) {
          const formattedMessage = {
            _id: uuidv4(), // Generate a unique ID for the message
            text: parsedMessage.message,
            createdAt: new Date(),
            user: {
              _id: parsedMessage.senderId, // ID of the sender
              name: receiver.username, // Fetch or set the sender's name dynamically
              avatar: 'https://placeimg.com/140/140/any', // Fetch or set the sender's avatar dynamically
            },
          };

          client.to(receiver.chatid).emit('reply', formattedMessage); // Emit formatted message
        } else {
          client.emit('error', { message: 'Recipient not found.' });
        }
      } else {
        client.emit('error', { message: 'No recipient specified.' });
      }
    } catch (error) {
      client.emit('error', { message: 'Error processing message.' });
      console.error('Error handling one-one-message:', error.message);
    }
  }

  @SubscribeMessage('group-message')
  handleNewGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: any,
  ) {
    try {
      const parsedMessage = JSON.parse(message);
      console.log('New group message received:', parsedMessage);
      client.broadcast.emit('reply', parsedMessage.message);
    } catch (error) {
      client.emit('error', { message: 'Error processing group message.' });
      console.error('Error handling group-message:', error.message);
    }
  }
}
