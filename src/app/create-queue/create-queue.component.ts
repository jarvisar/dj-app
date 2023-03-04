import { Component, OnInit } from '@angular/core';
import { JoinQueueComponent } from '../join-queue/join-queue.component';
import { QueueService } from '../queue.service';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-create-queue',
  templateUrl: './create-queue.component.html',
  styleUrls: ['./create-queue.component.scss']
})
export class CreateQueueComponent implements OnInit {

  errorMessage = '';
  newQueueName = 'New Queue';

  constructor(public websocketService: WebSocketService, public joinQueue: JoinQueueComponent, public queue: QueueService) { }

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

  createQueue(event: Event) {
    console.log("create");
    if (this.checkConnection()){
      return;
    }
    if(this.newQueueName != '') {
      this.websocketService.createQueue(this.newQueueName).subscribe(
      (data: any) => {
        console.log(data.code);
        if (data.code == ""){
          this.errorMessage = 'Error creating queue.';
          setTimeout(() => {
            this.errorMessage = ''; 
          }, 3000); 
        } else {
          console.log('Code:', data);
          this.errorMessage = '';
          this.queue.setCode = data.code;
          this.joinQueue.joinQueue();
        }
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

}
