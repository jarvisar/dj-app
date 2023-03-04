import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  public setCode: any;
  inQueue: boolean = false;
  currentQueueName = '';
  queueSongs: any = [];
  queueSessionId = '';
  requestedSongs: any = []; // should probably store in cache with queue code so user can't just refresh

  constructor() { }
}
