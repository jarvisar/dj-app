import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { LoadingService } from './loading.service';
import { finalize } from 'rxjs/operators';

@Injectable()
export class WebsocketLoadingInterceptor {
  private totalRequests = 0;

  constructor(private loadingService: LoadingService) { }

  intercept(webSocket: WebSocketSubject<any>) {
    this.totalRequests++;
    this.loadingService.setLoading(true);
    return webSocket.pipe(
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests === 0) {
          this.loadingService.setLoading(false);
        }
      })
    );
  }
}
