import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: Socket;

  constructor() { 
    this.socket = io('http://localhost:5000');
  }

  createQueue(): Observable<any> {

    return new Observable(observer => {
      this.socket.emit('create');

      this.socket.on('queue_created', (data: any) => {
        observer.next(data);
      });

    });
  }

  joinQueue(code: string) {
    return new Observable(observer => {
      this.socket.emit('join', { code });
      this.socket.on('queue_joined', (data: any) => {
        observer.next(data);
      });
      this.socket.on('invalid_code', (data: any) => {
        observer.next(data);
      });

    });
  }

  addSong(code: string, name: string, artist: string, track_id: string) {
    return new Observable(observer => {
      this.socket.emit('add_song', { code, name, artist, track_id });
      this.socket.on('song_added', (data: any) => {
        observer.next(data);
      });
      this.socket.on('invalid_code', (data: any) => {
        observer.next(data);
      });

    });
  }

  deleteSong(code: string, songId: string) {
    this.socket.emit('delete_song', { code, songId });
  }

  deleteQueue() {
    this.socket.emit('delete_queue');
  }

  onQueueCreated(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('queue_created', (data: any) => {
        observer.next(data);
      });
    });
  }
  

  onQueueJoined() {
    return new Observable((observer) => {
      this.socket.on('queue_joined', (data: any) => {
        observer.next(data);
      });
    });
  }

  onSongAdded() {
    return new Observable((observer) => {
      this.socket.on('song_added', (data: any) => {
        observer.next(data);
      });
    });
  }

  onSongDeleted() {
    return new Observable((observer) => {
      this.socket.on('song_deleted', (data: any) => {
        observer.next(data);
      });
    });
  }

  onInvalidCode() {
    return new Observable((observer) => {
      this.socket.on('invalid_code', () => {
        observer.next();
      });
    });
  }

  onInvalidSong() {
    return new Observable((observer) => {
      this.socket.on('invalid_song', () => {
        observer.next();
      });
    });
  }

  onInvalidDelete() {
    return new Observable((observer) => {
      this.socket.on('invalid_delete', () => {
        observer.next();
      });
    });
  }
}
