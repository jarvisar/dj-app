import { Component, OnInit } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { LoadingService } from './loading.service';

const maxVotes = 5
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
  showSearchTable: boolean = false;
  showQueueSongTable: boolean = false;
  errorMessage: string = '';
  numVotes = 0;
  maxVotes = false;
  queueSongs: any = [];
  searchData: any = [];
  queueSessionId = '';
  newQueueName = 'New Queue';
  currentQueueName = '';
  
  constructor(public loadingService: LoadingService, public websocketService: WebSocketService) {}

  ngOnInit() { }

  createQueue(event: Event) {
    console.log("create");
    if(this.newQueueName != '') {
      this.websocketService.createQueue(this.newQueueName).subscribe(
      (data: any) => {
        this.newlyCreatedCode = data.code;
        console.log(data.code);
        if (data.code == ""){
          this.errorMessage = 'Error creating queue.';
          setTimeout(() => {
            this.errorMessage = ''; 
          }, 3000); 
        } else {
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
    } else {
      this.errorMessage = 'Name cannot be blank.';
      setTimeout(() => {
        this.errorMessage = ''; 
      }, 3000); 
    }
  }

  songCount: any = [];
  joinQueue(event: Event) {
    console.log("join");
    this.websocketService.joinQueue(this.inputCode).subscribe(
      (data: any) => {
        if (data != undefined){
          this.setCode = data.code; // Make sure set code is the returned code
          this.inputCode = ""; // Blank input box
          this.currentQueueName = data.queue_name;
          console.log('Track Data:', data);
          let idList = [];
          this.songCount = [];
          for(let i = 0; i < data.songs.length; i++){
            idList.push(data.songs[i].track_id);
            this.songCount.push(data.songs[i].count)
          }
          this.websocketService.getTrackData(idList).subscribe((trackData: any) => {
            this.queueSongs = trackData;
            console.log(this.queueSongs);
            if (Object.keys(this.queueSongs).length != 0){ // Show queue song table only if not empty
              this.showQueueSongTable = true;
            }
          });

          this.inQueue = true;
          this.newlyCreatedCode = "";
          this.errorMessage = '';
          this.queueSessionId = data.session_id;
          console.log(this.queueSessionId);
          if(this.numVotes >= maxVotes){ // Check if user has already voted max amt of times
            this.maxVotesReached();
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

  updateQueueSongList(){

  }

  leaveQueue(event: Event) {
    this.inQueue = false;
    this.setCode = "";
    this.queueSongs = [];
    this.newlyCreatedCode = "";
    this.showQueueSongTable = false;
    this.numVotes = 0;
    this.requestedSongs = [];
  }

  trackId!: string;
  requestedSongs: any = [];
  addSong(event: Event, track: any) {
    console.log("add song");
    if(this.setCode != "") {
      if (this.requestedSongs.includes(track.id)) {
        console.log("Song has already been requested");
        return;
      }
      this.websocketService.addSong(this.setCode, track.name, track.artists[0].name, track.id).subscribe(
        (data: any) => {
          console.log('Track Data:', data);
          this.requestedSongs.push(track.id); // Push requested song's id to array (to prevent user from requesting same song twice)
          let idList = [];
          this.songCount = [];
          for(let i = 0; i < data.songs.length; i++){
            idList.push(data.songs[i].id);
            this.songCount.push(data.songs[i].count)
          }
          console.log('Cool stuff:', idList);
          this.websocketService.getTrackData(idList).subscribe((trackData: any) => {
            console.log('Cool stuff:', trackData);
            this.queueSongs = trackData;
            console.log(this.queueSongs);
            if (Object.keys(this.queueSongs).length != 0){ // Show queue song table only if not empty
              this.showQueueSongTable = true;
            }
          });
          this.numVotes = this.numVotes + 1;
          console.log(this.numVotes);
          if(this.queueSessionId == this.websocketService.sessionID){
            console.log("test")
            if(this.numVotes >= (maxVotes * 2)){ // Queue creators can add 10 starter songs
              this.maxVotesReached();
            }
          } else {
            if(this.numVotes >= (maxVotes)){ // Other users can add 5 songs to a queue
              this.maxVotesReached();
            }
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

  searchSpotify(event: Event) {
    console.log("search spotify");
    if (this.searchString != undefined && this.searchString != ""){
      this.websocketService.searchTracks(this.searchString).subscribe(
        (data: any) => {
          let idList = []
          for(let i = 0; i < data.length; i++){
            idList.push(data[i].track_id) // Get list of IDs
          }
          this.websocketService.getTrackData(idList).subscribe((trackData: any) => {
            this.searchData = trackData;
          });
          this.showSearchTable = true;
          this.errorMessage = '';
        },
        (error) => {
          console.error('Error:', error);
          this.showSearchTable = false;
          this.errorMessage = 'Error searching for tracks.';
            setTimeout(() => {
              this.errorMessage = ''; // remove class after animation ends
            }, 3000); // remove class after 5 seconds
        }
      );
    } else {
      this.errorMessage = 'Enter a valid search.';
      setTimeout(() => {
        this.errorMessage = ''; // remove class after animation ends
      }, 3000); // remove class after 5 seconds
    }

  }

  getAlbumArt(){

  }

  maxVotesReached(){
    this.maxVotes = true;
    this.errorMessage = 'Maximum Votes Reached.';
          setTimeout(() => {
            this.errorMessage = ''; // remove class after animation ends
          }, 3000); // remove class after 5 seconds
  }
 }

