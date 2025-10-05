import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EventEntity } from './entities/event.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  afterInit(server: Server) {
    this.logger.log('WebSocket Events Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Join the client to a general events room
    client.join('person-detections');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit a new person detection event to all connected clients
   */
  emitPersonDetection(event: EventEntity) {
    this.logger.log(`Emitting person detection event: ${event.id} - ${event.personName}`);

    // Emit to all clients in the person-detections room
    this.server.to('person-detections').emit('person-detected', {
      id: event.id,
      personName: event.personName,
      personId: event.personId,
      cardNumber: event.cardNumber,
      deviceName: event.deviceName,
      deviceId: event.deviceId,
      accessResult: event.accessResult,
      timestamp: event.timestamp,
      createdAt: event.createdAt,
      images: event.images?.map(img => ({
        id: img.id,
        filename: img.filename,
        publicUrl: img.publicUrl,
        mimeType: img.mimeType,
        size: img.size,
      })) || [],
    });
  }

  /**
   * Get the count of connected clients
   */
  getConnectedClientsCount(): number {
    return this.server.sockets.sockets.size;
  }
}