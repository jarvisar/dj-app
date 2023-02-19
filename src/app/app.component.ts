import { Component, OnInit } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'dj-app';
  inputCode!: string;
  inQueue: boolean = false;
  
  constructor(private websocketService: WebSocketService) {}

  ngOnInit() { }

  createQueue(event: Event) {
    console.log("create");
    this.websocketService.createQueue().subscribe(
      (data: any) => {
        console.log('Track Data:', data);
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  joinQueue(event: Event) {
    console.log("join");
    this.websocketService.joinQueue(this.inputCode).subscribe(
      (data: any) => {
        console.log('Track Data:', data);
      },
      (error) => {
        console.error('Error:', error);
      }
    );
    this.inQueue = true;
  }

  addSong(event: Event) {
    console.log("add song");
    this.websocketService.addSong(this.inputCode, "Test", "Test", "5ikjIVLHoBrgaZ0zNrn6Ty").subscribe(
      (data: any) => {
        console.log('Track Data:', data);
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
 }

