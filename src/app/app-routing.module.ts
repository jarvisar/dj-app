import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateQueueComponent } from './create-queue/create-queue.component';
import { HomeComponent } from './home/home.component';
import { JoinQueueComponent } from './join-queue/join-queue.component';
import { QueueViewComponent } from './queue-view/queue-view.component';
import { SpotifySearchComponent } from './spotify-search/spotify-search.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'join', component: JoinQueueComponent },
  { path: 'create', component: CreateQueueComponent },
  { path: 'queue', component: QueueViewComponent, canActivate: [AuthGuard] },
  { path: 'search', component: SpotifySearchComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' } // Redirect to the home page for all other routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
