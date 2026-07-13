import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';
import { AuthService } from './auth.service';

export interface PedidoStatusChangeEvent {
  pedidoId: string;
  fromStageId: string;
  toStageId: string;
  changedBy: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class RealtimeService {
  private socket: Socket | null = null;
  private connected = false;

  constructor(private authService: AuthService) {}

  connect(organizationId: string): void {
    if (this.connected) return;

    const token = localStorage.getItem('token');
    this.socket = io('http://localhost:3001/pedidos', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
      this.connected = true;
      this.socket!.emit('join-org', { organizationId });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  onPedidoStatusChanged(): Observable<PedidoStatusChangeEvent> {
    if (!this.socket) {
      return new Observable(observer => observer.error('Socket not connected'));
    }
    return fromEvent<PedidoStatusChangeEvent>(this.socket, 'pedido:status-changed');
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
