import { Component, OnInit } from '@angular/core';
import { QueueViewComponent } from '../queue-view/queue-view.component';
import { QueueService } from '../queue.service';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-spotify-search',
  templateUrl: './spotify-search.component.html',
  styleUrls: ['./spotify-search.component.scss']
})
export class SpotifySearchComponent implements OnInit {

  errorMessage = '';
  searchString!: string;
  searchData: any = [];

  constructor(public websocketService: WebSocketService, public queue: QueueService, public queueView: QueueViewComponent) { }

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

  searchSpotify(event: Event) {
    console.log("search spotify");
    if (this.checkConnection()){
      return;
    }
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
          this.errorMessage = '';
        },
        (error) => {
          console.error('Error:', error);
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

  addSong(event: Event, song: any){
    this.queueView.addSong(event, song);
  }

}
