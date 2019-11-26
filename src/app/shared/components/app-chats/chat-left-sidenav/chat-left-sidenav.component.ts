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
  contactsWindow: boolean = false
  userType : string;
  typeing:string = '';
  contactsWindowError: string = 'Hire an Advisor to start chatting and seek professional help!';
  @Output() chatWindowToggle = new EventEmitter();

  constructor(private chatService: ChatService, private loader: AppLoaderService) {}

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.userType = localStorage.getItem("endUserType");
      if(this.userType=='advisor') {
          this.contactsWindowError = 'Add clients to start chatting and provide professional help!';
      }
   
    this.userUpdateSub = this.chatService.onUserUpdated
      .subscribe(updatedUser => {
        this.currentUser = updatedUser;
      });

    this.loadDataSub = this.chatService.loadChatData()
      .subscribe(res => {
        this.currentUser = this.chatService.user;
        this.contacts = this.chatService.contacts;
        if(this.contacts.length==0){
          this.contactsWindow = true  
        }else{
          this.contactsWindow = false  
        }
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
                this.contacts[contactInd].unread = unreadCnt;
              }else{
                this.contacts[contactInd].unread = o.unread;
              }              
            }else {
              this.currentUser.chatInfo[0].unread = o.unread;
            }
          });
        }
       }
      });
      
      this.chatService.getOnlineStatus().subscribe((friendId:any) => {
        this.contacts = this.chatService.contacts;
        if(this.contacts.length==0){
          this.contactsWindow = true  
        }else{
          this.contactsWindow = false  
        }
      });

      this.chatService.getFromTyping().subscribe(id => {
        if(this.contacts!=undefined){
              let contactInd = this.contacts.findIndex((c) => c._id == id);
              if (contactInd && contactInd > -1) {
                this.contacts[contactInd].typeing = 'typing...';
                this.contacts[contactInd].status = 'online';                
              }
              setTimeout(()=>{           
                this.contacts[contactInd].typeing = '';
              },1500); 
         }
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
    if(this.currentUser.chatInfo && this.currentUser.chatInfo.length > 0){
      let contactInd = openwindow.findIndex((c) => c == contactId);
      if (contactInd && contactInd > -1) {
        this.currentUser.chatInfo[contactInd].unread = 0;
      }
    }

    this.chatService.getChatByContact(contactId)
      .subscribe(res => {
        //console.log('from sub',res);
      }, err => {
        console.log('err--',err)
      })
  }

}