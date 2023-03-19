import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthGuard } from '../auth.guard';
import { QueueService } from '../queue.service';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-join-queue',
  templateUrl: './join-queue.component.html',
  styleUrls: ['./join-queue.component.scss']
})
export class JoinQueueComponent implements OnInit {

  errorMessage = '';
  inputCode: string = '';

  constructor(public websocketService: WebSocketService, public queue: QueueService, private router: Router, private authGuard: AuthGuard) { }

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

  joinQueueSubscription!: Subscription;
  joinQueue(event?: Event) {
    console.log("join");
    if (this.checkConnection()){
      return;
    }
    // Unsubscribe from previous subscription if it exists
    if (this.joinQueueSubscription) {
      this.joinQueueSubscription.unsubscribe();
    }
    this.joinQueueSubscription = this.websocketService.joinQueue(this.inputCode).subscribe(
      (data: any) => {
        console.log("what??");
        console.log(data)
        if (data != undefined){
          this.queue.setCode = data.code; // Make sure set code is the returned code
          this.inputCode = ""; // Blank input box
          this.queue.currentQueueName = data.queue_name; // Set queue name
          let idList = [];
          this.authGuard.allowNavigationToQueue(); // Allow router navigation to queue
          this.router.navigate(['/queue']); // Navigate to queue
          for(let i = 0; i < data.songs.length; i++){
            idList.push(data.songs[i].track_id); // Create a list of all track IDs
            data.songs[i].count = data.songs[i].count; // Add count
          }
          if (idList.length != 0){
            this.websocketService.getTrackData(idList).subscribe((trackData: any) => { // Get track data from spotify
              console.log(trackData)
              for (let i = 0; i < trackData.tracks.length; i++) {
                let song = trackData.tracks[i];
                let count = data.songs.find((s: any) => s.track_id === song.id)?.count;
                song.count = count || 0; // Add count to track data 
              }
              this.queue.queueSongs = trackData.tracks.sort((a: any, b: any) => b.count - a.count); // Sort data by count
              console.log(this.queue.queueSongs);
            });
          }
          

          this.queue.inQueue = true;
          this.errorMessage = '';
          this.queue.queueSessionId = data.session_id;
          // if(this.numVotes >= maxVotes){ // Check if user has already voted max amt of times
          //   this.maxVotesReached();
          // }
        } else {
          console.log("error joining queue");
          this.errorMessage = 'Error joining queue.';
          this.queue.inQueue = false;
          setTimeout(() => {
            this.errorMessage = ''; // remove class after animation ends
          }, 3000); // remove class after 5 seconds
        }
        this.joinQueueSubscription.unsubscribe();
      },
      (error) => {
        console.error('Error:', error);
        this.errorMessage = 'Error joining queue.';
      }
    );
  }

}
