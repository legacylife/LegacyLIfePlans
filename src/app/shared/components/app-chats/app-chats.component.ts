import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { MatSidenav, MatDialog } from '@angular/material';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chats',
  templateUrl: './app-chats.component.html',
  styleUrls: ['./app-chats.component.css']
})
export class AppChatsComponent implements OnInit, OnDestroy {
  isMobile;
  screenSizeWatcher: Subscription;
  isSidenavOpen: Boolean = true;
  chattingWindow = false;

  @ViewChild(MatSidenav) public sideNav: MatSidenav;

  activeChatUser = {
    name: 'Gevorg Spartak',
    photo: 'assets/images/face-2.jpg',
    isOnline: true,
    lastMsg: 'Hello!'
  };
  user;


  constructor(
    private media: ObservableMedia, 
    public chatService: ChatService
  ) {
    console.log(chatService.chats)
    this.user = chatService.user
  }

  ngOnInit() {
    this.chatSideBarInit();
  }
  ngOnDestroy() {
    if (this.screenSizeWatcher) {
      this.screenSizeWatcher.unsubscribe();
    }
  }
  changeActiveUser(user) {
    this.activeChatUser = user;
  }
  
  updateSidenav() {
    setTimeout(() => {
      this.isSidenavOpen = !this.isMobile;
      if(this.sideNav)
        this.sideNav.mode = this.isMobile ? 'over' : 'side';
    }, 100);
  }
  chatSideBarInit() {
    this.isMobile = this.media.isActive('xs') || this.media.isActive('sm');
    this.updateSidenav();
    this.screenSizeWatcher = this.media.subscribe((change: MediaChange) => {
      this.isMobile = (change.mqAlias === 'xs') || (change.mqAlias === 'sm');
      this.updateSidenav();
    });
  }

  chatWindowLeft(chatWindowLeftVar){
    this.chattingWindow = true
  }
  chatWindowMain(chatWindowMainVar){
    this.chattingWindow = false
  }

  
}
