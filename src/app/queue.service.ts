import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  public inputCode: any;
  inQueue: boolean = false;

  constructor() { }
}
