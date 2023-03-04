import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateQueueComponent } from './create-queue/create-queue.component';
import { HomeComponent } from './home/home.component';
import { JoinQueueComponent } from './join-queue/join-queue.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'join', component: JoinQueueComponent },
  { path: 'create', component: CreateQueueComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
