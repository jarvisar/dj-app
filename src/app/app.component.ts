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
  searchString!: string;
  inQueue: boolean = false;
  showTable: boolean = false;
  trackData = [];
  
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
        if (data != undefined){
          console.log('Track Data:', data);
          this.inQueue = true;
        } else {
          console.log("error joining queue");
          this.inQueue = false;
        }
      }
    );
    
  }

  trackId!: string;
  addSong(event: Event, trackId: string) {
    console.log("add song");
    this.websocketService.addSong(this.inputCode, "Test", "Test", trackId).subscribe(
      (data: any) => {
        console.log('Track Data:', data);
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  // searchSpotify(event: Event) {
  //   console.log("search spotify");
  //   console.log(this.websocketService.searchTracks(this.searchString));
  // }

  searchSpotify(event: Event) {
    console.log("search spotify");
    this.websocketService.searchTracks(this.searchString).subscribe(
      (data: any) => {
        this.trackData = data;
        this.showTable = true;
      },
      (error) => {
        console.error('Error:', error);
        this.showTable = false;
      }
    );
  }
 }

