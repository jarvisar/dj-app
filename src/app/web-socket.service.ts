import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

const url = 'http://localhost:5000'
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: Socket;
  public errorMsg: any;
  private SESSION_ID = 'sessionIDCache';
  private EXPIRY_TIME = 2 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  public sessionID!: string;

  constructor(private http: HttpClient) { 
    this.socket = io(url);
    this.socket.on("connect_error", (error) => {
      this.errorMsg = "Unable to connect to server.";
    });
    let sessionIDCache = localStorage.getItem(this.SESSION_ID);
    // Check for cached data
    if (sessionIDCache) {
      let cacheData = JSON.parse(sessionIDCache);
      if (cacheData.expiry > Date.now()) {
        this.sessionID = cacheData.sessionID;
        console.log(cacheData.sessionID);
        return;
      }
    }
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let sessionID = '';
    for (let i = 0; i < 20; i++) {
      sessionID += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.sessionID = sessionID;
    let expiry = Date.now() + this.EXPIRY_TIME;
    localStorage.setItem(this.SESSION_ID, JSON.stringify({ expiry, sessionID }));
  }

  searchTracks(query: string) {
    let searchUrl = url + '/search?query=' + query;
    return this.http.get(searchUrl);
  }

  getTrackData(trackList: any) {
    console.log(trackList)
    let searchUrl = url + '/get_track_data?';
    let temp = ''
    for(let i = 0; i < trackList.length; i++){
      temp += ('&track_id=' + trackList[i])
    }
    console.log(searchUrl + temp);
    return this.http.get(searchUrl + temp);
  }

  createQueue(queueName: any): Observable<any> {
    let sessionID = this.sessionID;
    console.log("hi!")
    return new Observable(observer => {
      this.socket.emit('create', { sessionID, queueName });

      this.socket.once('queue_created', (data: any) => {
        observer.next(data);
      });

    });
  }

  joinQueue(code: string) {
    return new Observable(observer => {
      this.socket.emit('join', { code });
      this.socket.once('queue_joined', (data: any) => {
        observer.next(data);
      });
      this.socket.once('invalid_code', (data: any) => {
        observer.next(data);
      });

    });
  }

  addSong(code: string, name: string, artist: string, track_id: string) {
    return new Observable(observer => {
      this.socket.once('song_added', (data: any) => {
        observer.next(data);
      });
      this.socket.once('invalid_code', (data: any) => {
        observer.next(data);
      });
      this.socket.emit('add_song', { code, name, artist, track_id });
    });
  }
  

  deleteSong(code: string, songId: string) {
    this.socket.emit('delete_song', { code, songId });
  }

  deleteQueue(code: string) {
    this.socket.emit('delete_queue', { code });
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
