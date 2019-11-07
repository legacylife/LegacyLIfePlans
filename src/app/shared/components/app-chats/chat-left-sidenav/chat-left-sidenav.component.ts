import { Component, OnInit } from "@angular/core";
import { ChatService, User } from "../chat.service";
import { Subscription } from "rxjs";
console.log('chat left side')
@Component({
  selector: "app-chat-left-sidenav",
  templateUrl: "./chat-left-sidenav.component.html",
  styleUrls: ["./chat-left-sidenav.component.scss"]
})
export class ChatLeftSidenavComponent implements OnInit {
  userUpdateSub: Subscription;
  loadDataSub: Subscription;
  
  isSidenavOpen = true;

  currentUser: User = new User();
  contacts: any[];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    console.log('chat left side@#@#@#@##@#')
    // this.chatService.onChatsUpdated
    //   .subscribe(updatedChats => {
    //     this.chats = updatedChats;
    //   });
console.log('chat left side ###########',this.chatService.onUserUpdated);
    this.userUpdateSub = this.chatService.onUserUpdated
      .subscribe(updatedUser => {
        this.currentUser = updatedUser;
      });
console.log('1111111111111');
    this.loadDataSub = this.chatService.loadChatData()
      .subscribe(res => {
        this.currentUser = this.chatService.user;
        // this.chats = this.chatService.chats;
        console.log('3333333333333');        
        this.contacts = this.chatService.contacts;
        console.log('contacts######',this.contacts);        
      });
  }
  ngOnDestroy() {
    if( this.userUpdateSub ) this.userUpdateSub.unsubscribe();
    if( this.loadDataSub ) this.loadDataSub.unsubscribe();
  }

  getChatByContact(contactId) { 
    this.chatService.getChatByContact(contactId)
      .subscribe(res => {
        // console.log('from sub',res);
      }, err => {
        console.log(err)
      })
  }
  
}
