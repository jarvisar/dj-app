import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { io } from 'socket.io-client';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule  } from '@angular/common/http';
import { LoadingInterceptor } from './loading-interceptor.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { JoinQueueComponent } from './join-queue/join-queue.component';
import { CreateQueueComponent } from './create-queue/create-queue.component';
import { QueueViewComponent } from './queue-view/queue-view.component';
import { SpotifySearchComponent } from './spotify-search/spotify-search.component';
import { HomeComponent } from './home/home.component';
import { CustomReuseStrategy } from './route-reuse.strategy';
import { Route, RouterModule, RouteReuseStrategy } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    JoinQueueComponent,
    CreateQueueComponent,
    QueueViewComponent,
    SpotifySearchComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatTableModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }, { provide: RouteReuseStrategy, useClass: CustomReuseStrategy}, HttpClientModule, JoinQueueComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
