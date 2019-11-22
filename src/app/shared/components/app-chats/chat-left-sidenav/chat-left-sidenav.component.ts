import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { ChatService, User } from "../../../services/chat.service";
import { Subscription } from "rxjs";
//import { cloneDeep } from "lodash";
import { AppLoaderService } from '../../../services/app-loader/app-loader.service';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";
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
  chatWindow: boolean = false

  @Output() chatWindowToggle = new EventEmitter();

  constructor(private chatService: ChatService, private loader: AppLoaderService) {}

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    // this.chatService.onChatsUpdated
    //   .subscribe(updatedChats => {
    //     this.chats = updatedChats;
    //   });
    //console.log('chat left side ###########',this.chatService.onUserUpdated);
    //this.loader.open();
    this.userUpdateSub = this.chatService.onUserUpdated
      .subscribe(updatedUser => {
        this.currentUser = updatedUser;
      });

    this.loadDataSub = this.chatService.loadChatData()
      .subscribe(res => {
        //this.loader.close();
        this.currentUser = this.chatService.user;
        // this.chats = this.chatService.chats;
        this.contacts = this.chatService.contacts;
      });
      this.chatService.getMessagesUnreadCnt().subscribe((count:any) => {
        var totalCount = 0
        if(this.contacts!=undefined){
        if(count.length > 0) {
          count.map((o) => { 
            totalCount += o.unread;
            let contactInd = this.contacts.findIndex((c) => c._id == o.user_id);
            if (contactInd && contactInd > -1) {
              this.contacts[contactInd].unread = o.unread;
              if(o.unread!=undefined && o.unread>0){
                let unreadCnt = o.unread;
                if(o.unread>99){
                  unreadCnt = o.unread+'+';
                }
               //8 this.currentUser.chatInfo[contactInd].unread = o.unread;
                this.contacts[contactInd].unread = o.unread;
              }else{
                this.contacts[contactInd].unread = o.unread;
              }              
            }else {
              this.currentUser.chatInfo[0].unread = o.unread;
            }
          });
          // this.unreadCount = totalCount+'+';
        }
       }
      });
      this.chatService.getOnlineStatus().subscribe((friendId:any) => {
        this.contacts = this.chatService.contacts;
      });
  }

  ngOnDestroy() {
    if( this.userUpdateSub ) this.userUpdateSub.unsubscribe();
    if( this.loadDataSub ) this.loadDataSub.unsubscribe();
  }

  getChatByContact(contactId) { 
    this.chatWindow = true;
    this.chatWindowToggle.emit(this.chatWindow);
    const selected = ['contactId'];
    const openwindow = this.currentUser.chatInfo.map(x => {selected.includes(x.contactId); return x.contactId});
    if(this.currentUser.chatInfo.length > 0){
      let contactInd = openwindow.findIndex((c) => c == contactId);
      this.currentUser.chatInfo[contactInd].unread = 0;
    }
    
    //console.log('contactInd',contactInd,'here',this.currentUser.chatInfo[contactInd],'---',this.currentUser.chatInfo[contactInd].unread)
    
    //this.currentUser.chatInfo[contactId].unread = 0;
    this.chatService.getChatByContact(contactId)
      .subscribe(res => {
        //console.log('from sub',res);
      }, err => {
        console.log('err--',err)
      })
  }
  
 



}