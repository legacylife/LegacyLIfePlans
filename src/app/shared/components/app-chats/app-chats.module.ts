console.log('chatModule -----')
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  MatIconModule,
  MatButtonModule,
  MatSidenavModule,
  MatMenuModule,
  MatInputModule,
  MatListModule,
  MatToolbarModule,
  MatCardModule
 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

//import { SharedModule } from '../../shared.module'
import { AppChatsComponent } from './app-chats.component';
import { ChatsRoutes } from './app-chats.routing';
import { ChatService } from '../../services/chat.service';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
   // SharedModule,
    MatSidenavModule,
    MatMenuModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatToolbarModule,
    MatCardModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    RouterModule.forChild(ChatsRoutes)
  ],
  declarations: [],
  providers: [ ChatService ]
})
export class AppChatsModule {}