import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGuard } from '../auth.guard';
import { LoadingService } from '../loading.service';
import { QueueService } from '../queue.service';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-queue-view',
  templateUrl: './queue-view.component.html',
  styleUrls: ['./queue-view.component.scss']
})
export class QueueViewComponent implements OnInit {

  errorMessage: any;
  public maxVotes = false;

  constructor(public websocketService: WebSocketService, public queue: QueueService, public loadingService: LoadingService, private router: Router, private authGuard: AuthGuard) { }

  ngOnInit(): void {
  }

  checkConnection(): Boolean{
    if (this.websocketService.errorMsg != undefined){
      this.errorMessage = this.websocketService.errorMsg;
      setTimeout(() => {
        this.errorMessage = ''; 
      }, 3000); 
      return true;
    } else {
      return false;
    }
  }

  addSong(event: Event, track: any) {
    console.log("add song");
    if (this.checkConnection()){
      return;
    }
    let isTrackInQueue = false;
    let index = 0;
    if (this.queue.setCode) {
      if (this.queue.requestedSongs.includes(track.id)) {
        console.log("Song has already been requested");
        return;
      }
      for (let i = 0; i < this.queue.queueSongs.length; i++) {
        if (this.queue.queueSongs[i].id === track.id) { // Check if song is already in queueSongs
          isTrackInQueue = true;
          index = i;
          break;
        }
      }
      if (isTrackInQueue) { // already in queueSongs, so just update count
        this.websocketService.addSong(this.queue.setCode, track.name, track.artists[0].name, track.id).subscribe(
          ({ songs }: any) => {
            this.queue.requestedSongs.push(track.id);
            this.queue.queueSongs[index].count += 1; // Only update count client-side
            //this.numVotes++;
            this.queue.queueSongs = this.queue.queueSongs.sort((a: any, b: any) => b.count - a.count);
          },
          (error) => {
            console.error('Error:', error);
            this.errorMessage = 'Error Adding Song'
            setTimeout(() => {
              this.errorMessage = ''; // remove class after animation ends
            }, 3000); // remove class after 5 seconds
          }
        );
      } else { // song not in queueSongs, need to add and update queueSongs with new song
        this.websocketService.addSong(this.queue.setCode, track.name, track.artists[0].name, track.id).subscribe(
          ({ songs }: any) => {
            this.queue.requestedSongs.push(track.id);
            this.websocketService.getTrackData([track.id]).subscribe((trackData: any) => {
              console.log(trackData)
              trackData[0].count = 1; // song not in queue so must be first request
              this.queue.queueSongs.push(trackData[0]);
            });
            //this.numVotes++;
            this.queue.queueSongs = this.queue.queueSongs.sort((a: any, b: any) => b.count - a.count);
          },
          (error) => {
            console.error('Error:', error);
            this.errorMessage = 'Error Adding Song'
            setTimeout(() => {
              this.errorMessage = ''; // remove class after animation ends
            }, 3000); // remove class after 5 seconds
          }
        );
      }
      // if(this.queue.queueSessionId == this.websocketService.sessionID){
      //   if(this.numVotes >= (maxVotes * 2)){ // Queue creators can add 10 starter songs
      //     this.maxVotesReached();
      //   }
      // } else {
      //   if(this.numVotes >= (maxVotes)){ // Other users can add 5 songs to a queue
      //     this.maxVotesReached();
      //   }
      // }
    } else {
      console.log("Join a queue before adding a song");
    }
  }

  spotifySearch(event: Event){
    this.authGuard.allowNavigationToQueue(); // Allow router navigation to queue
    this.router.navigate(['/search']); // Navigate to queue
  }
}
