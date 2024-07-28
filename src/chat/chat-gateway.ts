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
import { MessageStructure } from './dto/chat.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

const users = [];
let user = 0;

@WebSocketGateway(3200, { cors: { origin: '*' } })
@ApiBearerAuth('JWT-auth')
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly jwtService: JwtService) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      client.emit('error', { message: 'No token provided. Please log in.' });
      client.disconnect();
      return; // Gracefully handle disconnection
    }

    try {
      const decoded = this.jwtService.verify(token);
      user++;
      users.push({ id: user, clientId: client.id, userId: decoded.sub });
      console.log('New client connected', client.id);
      console.log(users);
    } catch (e) {
      client.emit('error', { message: 'Invalid token. Please log in again.' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected', client.id);
    const index = users.findIndex((usr) => usr.clientId === client.id);
    if (index !== -1) {
      users.splice(index, 1);
    }
    console.log(users);
  }

  @SubscribeMessage('one-one-message')
  handleNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: any,
  ) {
    try {
      const parsedMessage = JSON.parse(message);
      console.log('New message received: ', parsedMessage);

      if (parsedMessage.recieverId) {
        const receiverSocketId = users.find(
          (usr) => usr.id === parsedMessage.recieverId,
        );
        console.log('Recipient socket ID:', receiverSocketId);

        if (receiverSocketId) {
          client
            .to(receiverSocketId.clientId)
            .emit('reply', parsedMessage.message);
        } else {
          client.emit('error', { message: 'Recipient not found.' });
        }
      }
    } catch (e) {
      client.emit('error', { message: 'Error processing message.' });
      console.error('Error handling one-one-message:', e.message);
    }
  }

  @SubscribeMessage('group-message')
  handleNewGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: any,
  ) {
    try {
      const parsedMessage = JSON.parse(message);
      console.log('New group message received: ', parsedMessage);
      client.broadcast.emit('reply', parsedMessage.message);
    } catch (e) {
      client.emit('error', { message: 'Error processing group message.' });
      console.error('Error handling group-message:', e.message);
    }
  }
}
