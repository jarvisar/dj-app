import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QueueService } from '../queue.service';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-join-queue',
  templateUrl: './join-queue.component.html',
  styleUrls: ['./join-queue.component.scss']
})
export class JoinQueueComponent implements OnInit {

  errorMessage = '';
  inputCode!: string;

  constructor(public websocketService: WebSocketService, public queue: QueueService, private router: Router) { }

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

  joinQueue(event?: Event) {
    console.log("join");
    if (this.checkConnection()){
      return;
    }
    this.websocketService.joinQueue(this.inputCode).subscribe(
      (data: any) => {
        if (data != undefined){
          this.queue.setCode = data.code; // Make sure set code is the returned code
          this.inputCode = ""; // Blank input box
          this.queue.currentQueueName = data.queue_name; // Set queue name
          let idList = [];
          this.router.navigate(['/queue']); // Route user to queue view component (song list)
          for(let i = 0; i < data.songs.length; i++){
            idList.push(data.songs[i].track_id); // Create a list of all track IDs
            data.songs[i].count = data.songs[i].count; // Add count
          }
          this.websocketService.getTrackData(idList).subscribe((trackData: any) => { // Get track data from spotify
            for (let i = 0; i < trackData.length; i++) {
              let song = trackData[i];
              let count = data.songs.find((s: any) => s.track_id === song.id)?.count;
              song.count = count || 0; // Add count to track data 
            }
            this.queue.queueSongs = trackData.sort((a: any, b: any) => b.count - a.count); // Sort data by count
            console.log(this.queue.queueSongs);
          });

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
        
      },
      (error) => {
        console.error('Error:', error);
        this.errorMessage = 'Error joining queue.';
      }
    );
  }

}
