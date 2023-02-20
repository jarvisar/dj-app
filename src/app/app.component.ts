import { Component, OnInit } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

const maxVotes = 10
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
  numVotes = 0;
  maxVotes = false;
  queueSongs: any = [];
  searchData: any = [];
  
  constructor(private websocketService: WebSocketService) {}

  ngOnInit() { }

  createQueue(event: Event) {
    console.log("create");
    try {
      this.websocketService.createQueue().subscribe(
      (data: any) => {
        this.newlyCreatedCode = data.code;
        console.log(data.code);
        if (data.code == ""){
          this.errorMessage = 'Error creating queue.';
          setTimeout(() => {
            this.errorMessage = ''; 
          }, 3000); 
        }
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
    )
    } catch(e) {
      console.log("test")
    }
  }

  joinQueue(event: Event) {
    console.log("join");
    this.websocketService.joinQueue(this.inputCode).subscribe(
      (data: any) => {
        if (data != undefined){
          this.setCode = data.code;
          this.queueSongs = data.songs;
          this.inputCode = "";
          console.log('Track Data:', data);
          this.inQueue = true;
          this.newlyCreatedCode = "";
          this.errorMessage = '';
          if(this.numVotes >= 5){
            this.maxVotes = true;
          }
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
    this.queueSongs = [];
    this.newlyCreatedCode = "";
  }

  trackId!: string;
  requestedSongs: any = [];
  addSong(event: Event, track: any) {
    console.log("add song");
    if(this.setCode != "") {
      if (this.requestedSongs.includes(track.track_id)) {
        console.log("Song has already been requested");
        return;
      }
      this.websocketService.addSong(this.setCode, track.song_name, track.artist_name, track.track_id).subscribe(
        (data: any) => {
          console.log('Track Data:', data);
          this.requestedSongs.push(track.track_id);
          this.numVotes = this.numVotes + 1;
          console.log(this.numVotes);
          if(this.numVotes >= 5){
            this.maxVotes = true;
          }
          console.log(this.requestedSongs);
        },
        (error) => {
          console.error('Error:', error);
          this.errorMessage = 'Error Adding Song'
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
        this.searchData = data;
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

