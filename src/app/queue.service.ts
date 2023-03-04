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

  constructor() { }
}
