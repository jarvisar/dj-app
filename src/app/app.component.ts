import { Component, OnInit } from '@angular/core';
import { WebSocketService } from './web-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'dj-app';

  
  constructor(private websocketService: WebSocketService) {}

  ngOnInit() { }

  getTrackData(event: Event) {
    console.log("hi");
    this.websocketService.createQueue().subscribe(
      (data: any) => {
        console.log('Track Data:', data);
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
 }

