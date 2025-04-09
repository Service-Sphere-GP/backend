import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  private wsJwtGuard: WsJwtGuard;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.wsJwtGuard = new WsJwtGuard(jwtService, configService, usersService);
  }

  afterInit() {
    this.logger.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const canActivate = await this.wsJwtGuard.canActivate({
        switchToWs: () => ({ getClient: () => client }),
      } as any);

      if (!canActivate) {
        this.logger.warn(`Disconnecting unauthenticated client: ${client.id}`);
      } else {
        this.logger.log(
          `Client authenticated: ${client.id}, User ID: ${client.data.user?.userId}`,
        );
      }
    } catch (e) {
      this.logger.error(`Authentication error for ${client.id}: ${e.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('test')
  handleTest(client: Socket, payload: any): void {
    this.logger.log(
      `Test message received from client ${client.id}: ${payload}`,
    );
    client.emit('testResponse', { message: 'Test response' });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() payload: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.data.user.userId;
    const { bookingId } = payload;
    this.logger.log(
      `User ${userId} attempting to join room for booking ${bookingId}`,
    );

    try {
      await this.chatService.validateUserAccess(userId, bookingId);
      const roomName = `booking_${bookingId}`;
      client.join(roomName);
      this.logger.log(`User ${userId} joined room: ${roomName}`);

      const history = await this.chatService.getChatHistory(userId, bookingId);
      client.emit('chatHistory', history);
    } catch (error) {
      this.logger.error(
        `Failed to join room ${bookingId} for user ${userId}: ${error.message}`,
      );
      client.emit('error', `Failed to join room: ${error.message}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const senderId = client.data.user.userId;
    const { bookingId, content } = payload;
    this.logger.log(`User ${senderId} sending message to booking ${bookingId}`);

    try {
      const savedMessage = await this.chatService.createMessage(
        senderId,
        bookingId,
        content,
      );

      const roomName = `booking_${bookingId}`;
      this.server.to(roomName).emit('receiveMessage', savedMessage);
      this.logger.log(`Message sent to room ${roomName}`);
    } catch (error) {
      this.logger.error(
        `Failed to send message for booking ${bookingId} by user ${senderId}: ${error.message}`,
      );
      client.emit('error', `Failed to send message: ${error.message}`);
    }
  }
}
