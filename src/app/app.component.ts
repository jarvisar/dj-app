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
  setCode: string = '';
  newlyCreatedCode: string = '';
  searchString!: string;
  inQueue: boolean = false;
  showTable: boolean = false;
  errorMessage: string = '';
  trackData = [];
  
  constructor(private websocketService: WebSocketService) {}

  ngOnInit() { }

  createQueue(event: Event) {
    console.log("create");
    this.websocketService.createQueue().subscribe(
      (data: any) => {
        this.newlyCreatedCode = data.code;
        console.log('Code:', data);
        this.errorMessage = '';
      },
      (error) => {
        console.error('Error:', error);
        this.errorMessage = 'Error creating queue.';
          setTimeout(() => {
            this.errorMessage = ''; 
          }, 3000); 
      }
    );
  }

  joinQueue(event: Event) {
    console.log("join");
    this.websocketService.joinQueue(this.inputCode).subscribe(
      (data: any) => {
        if (data != undefined){
          this.setCode = data.code;
          this.inputCode = "";
          console.log('Track Data:', data);
          this.inQueue = true;
          this.newlyCreatedCode = "";
          this.errorMessage = '';
        } else {
          console.log("error joining queue");
          this.errorMessage = 'Error joining queue.';
          this.inQueue = false;
          setTimeout(() => {
            this.errorMessage = ''; // remove class after animation ends
          }, 3000); // remove class after 5 seconds
        }
        
      },
      (error) => {
        console.error('Error:', error);
        this.errorMessage = 'Error joining queue.';
      }
    );
  }

  leaveQueue(event: Event) {
    this.inQueue = false;
    this.setCode = "";
    this.newlyCreatedCode = "";
  }

  trackId!: string;
  requestedSongs: any = [];
  addSong(event: Event, trackId: string) {
    console.log("add song");
    if(this.setCode != "") {
      if (this.requestedSongs.includes(trackId)) {
        console.log("Song has already been requested");
        return;
      }
      this.websocketService.addSong(this.setCode, "Test", "Test", trackId).subscribe(
        (data: any) => {
          console.log('Track Data:', data);
          this.requestedSongs.push(trackId);
          console.log(this.requestedSongs);
        },
        (error) => {
          console.error('Error:', error);
          setTimeout(() => {
            this.errorMessage = ''; // remove class after animation ends
          }, 3000); // remove class after 5 seconds
        }
      );
    } else {
      console.log("Join a queue before adding a song");
    }
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
        this.errorMessage = '';
      },
      (error) => {
        console.error('Error:', error);
        this.showTable = false;
        this.errorMessage = 'Error searching for tracks.';
          setTimeout(() => {
            this.errorMessage = ''; // remove class after animation ends
          }, 3000); // remove class after 5 seconds
      }
    );
  }
 }

