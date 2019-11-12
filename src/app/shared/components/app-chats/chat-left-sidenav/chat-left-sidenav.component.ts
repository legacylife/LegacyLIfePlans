import { Component, OnInit } from "@angular/core";
import { ChatService, User } from "../../../services/chat.service";
import { Subscription } from "rxjs";
@Component({
  selector: "app-chat-left-sidenav",
  templateUrl: "./chat-left-sidenav.component.html",
  styleUrls: ["./chat-left-sidenav.component.scss"]
})
export class ChatLeftSidenavComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  userUpdateSub: Subscription;
  loadDataSub: Subscription;
  isSidenavOpen = true;
  currentUser: User = new User();
  contacts: any[];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    // this.chatService.onChatsUpdated
    //   .subscribe(updatedChats => {
    //     this.chats = updatedChats;
    //   });
    //console.log('chat left side ###########',this.chatService.onUserUpdated);
    this.userUpdateSub = this.chatService.onUserUpdated
      .subscribe(updatedUser => {
        this.currentUser = updatedUser;
      });

    this.loadDataSub = this.chatService.loadChatData()
      .subscribe(res => {
        this.currentUser = this.chatService.user;
        // this.chats = this.chatService.chats;
        this.contacts = this.chatService.contacts;
      });
  }

  ngOnDestroy() {
    if( this.userUpdateSub ) this.userUpdateSub.unsubscribe();
    if( this.loadDataSub ) this.loadDataSub.unsubscribe();
  }

  getChatByContact(contactId) { 
    console.log(' left side bar getChatByContact ',contactId);
    this.chatService.getChatByContact(contactId)
      .subscribe(res => {
        console.log('from sub',res);
      }, err => {
        console.log(err)
      })
  }
  
}