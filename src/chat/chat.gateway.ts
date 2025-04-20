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
import {
  Logger,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { NotificationService } from '../notifications/notifications.service';

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
  private userSocketMap = new Map<string, string[]>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
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
        const userId = client.data.user?.userId;
        this.logger.log(
          `Client authenticated: ${client.id}, User ID: ${userId}`,
        );
        if (userId) {
          const userSockets = this.userSocketMap.get(userId) || [];
          userSockets.push(client.id);
          this.userSocketMap.set(userId, userSockets);

          const notificationRoom = `notifications_${userId}`;
          client.join(notificationRoom);
          this.logger.log(
            `User ${userId} joined notification room: ${notificationRoom}`,
          );
          try {
            const unreadNotifications =
              await this.notificationService.getUserUnreadNotifications(userId);
            if (unreadNotifications.length > 0) {
              this.logger.log(
                `Sending ${unreadNotifications.length} unread notifications to user ${userId}`,
              );
              client.emit('unreadNotifications', unreadNotifications);
            }
          } catch (error) {
            this.logger.error(
              `Error fetching unread notifications for user ${userId}: ${error.message}`,
            );
          }
        }
      }
    } catch (e) {
      this.logger.error(`Authentication error for ${client.id}: ${e.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const userId = client.data?.user?.userId;
    if (userId) {
      const userSockets = this.userSocketMap.get(userId) || [];
      const updatedSockets = userSockets.filter(
        (socketId) => socketId !== client.id,
      );

      if (updatedSockets.length > 0) {
        this.userSocketMap.set(userId, updatedSockets);
      } else {
        this.userSocketMap.delete(userId);
      }
    }
  }

  sendNotificationToUser(userId: string, notification: any): void {
    const notificationRoom = `notifications_${userId}`;
    this.server.to(notificationRoom).emit('notification', notification);
    this.logger.log(`Notification sent to user ${userId}`);
  }

  isUserOnline(userId: string): boolean {
    return (
      this.userSocketMap.has(userId) &&
      this.userSocketMap.get(userId).length > 0
    );
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribeToNotifications')
  handleSubscribeToNotifications(@ConnectedSocket() client: Socket): void {
    const userId = client.data.user.userId;
    const notificationRoom = `notifications_${userId}`;

    client.join(notificationRoom);
    this.logger.log(`User ${userId} subscribed to notifications`);
    client.emit('notificationSubscription', {
      success: true,
      message: 'Subscribed to notifications',
    });
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
    @MessageBody() payload: any, //TODO use the dto instead
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.data.user.userId;
    payload = JSON.parse(payload);
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
    @MessageBody() payload: any, //TODO use the dto instead
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const senderId = client.data.user.userId;
    payload = JSON.parse(payload);
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
