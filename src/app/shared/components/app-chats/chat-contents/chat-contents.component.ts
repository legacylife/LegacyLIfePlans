import { Component, OnInit, ViewChild, ViewChildren, Input, OnDestroy, EventEmitter, Output } from "@angular/core";
import { PerfectScrollbarDirective } from "ngx-perfect-scrollbar";
import { ChatService, ChatCollection, User, Chat } from "../../../services/chat.service";
import { NgForm } from "@angular/forms";
import { Subscription } from 'rxjs';
import { serverUrl } from './../../../../config'
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import * as io from 'socket.io-client';
@Component({
  selector: "app-chat-contents",
  templateUrl: "./chat-contents.component.html",
  styleUrls: ["./chat-contents.component.scss"]
})
export class ChatContentsComponent implements OnInit, OnDestroy {
  user: User = new User();
  activeContact: User = new User();
  public chatCollection: ChatCollection;
  profilePicture: any = "assets/images/arkenea/default.jpg"
  userUpdateSub: Subscription;
  chatUpdateSub: Subscription;
  chatSelectSub: Subscription;
  messages: any[] = []
  isButtonEnabled:boolean = false;
  fullName : string = '';
  userId : string;
  userType : string;
  typeing:string = '';
  showEmojiPicker = false;
  @Input('matSidenav') matSidenav;
  @ViewChild(PerfectScrollbarDirective) psContainer: PerfectScrollbarDirective;
  @Output() hideWindowToggle = new EventEmitter();

  @ViewChildren("msgInput") msgInput;
  @ViewChild("msgForm") msgForm: NgForm;

  constructor(private chatService: ChatService, private picService : ProfilePicService) {}

  ngOnInit() {
    this.picService.itemValue.subscribe((nextValue) => {
      if(nextValue)
        this.profilePicture =  nextValue
    })
    if(localStorage.getItem('endUserProfilePicture') != "undefined" && localStorage.getItem('endUserProfilePicture') != 'assets/images/arkenea/default.jpg'){
      this.profilePicture = localStorage.getItem('endUserProfilePicture') 
    }
    if(localStorage.getItem('endUserFirstName') != "undefined" && localStorage.getItem('endUserFirstName') != null && localStorage.getItem('endUserLastName') != "undefined"){
       this.fullName = localStorage.getItem('endUserFirstName')+' '+localStorage.getItem('endUserLastName');
    }
    this.userId = localStorage.getItem("endUserId");
    this.userType = localStorage.getItem("endUserType");

    // var socket = io(serverUrl);
    // console.log('message-unread-count call from chat content')
    // socket.emit('message-unread-count',{userId:this.userId,userType:this.userType});
    // Listen for user update
   this.userUpdateSub = this.chatService.onUserUpdated.subscribe(user => {
      //console.log('ngOnInit chat user',user)
      this.user = user;
    });

    this.chatService.getTyping().subscribe(id => {
     this.typeing = 'typing...';
      setTimeout(()=>{           
        this.typeing = '';
      },1500); 
    });

    this.chatService.getMessagesUnreadCnt().subscribe((count: string) => {
      //console.log("getMessagesUnreadCnt ", count)
    });
   
    this.chatService.getMessages().subscribe((message: string) => {
        this.messages.push(message);
    });


    this.chatService.getOnlineStatus().subscribe((friendId:any) => {
    });

    // Listen for contact change
    this.chatSelectSub = this.chatService.onChatSelected.subscribe(res => {
      if (res) {
        this.chatCollection = res.chatCollection;
        this.activeContact = res.contact;
        this.initMsgForm();
      }
    });

    // Listen for chat update
    this.chatUpdateSub = this.chatService.onChatsUpdated.subscribe(chat => {
        if (this.chatCollection.chats.indexOf(chat) == -1) {
          this.chatCollection.chats.push(chat);
        }        
        this.scrollToBottom();
    })
  }
  
  ngOnDestroy() {
    if( this.userUpdateSub ) this.userUpdateSub.unsubscribe();
    if( this.chatSelectSub ) this.chatSelectSub.unsubscribe();
    if( this.chatUpdateSub ) this.chatUpdateSub.unsubscribe();
  }
  
  checkSend(e) {
    let re = /(^|[.!?]\s+)([a-z])/g;
    var textBox: HTMLInputElement = <HTMLInputElement>e.target;
    if(textBox.value.trim()){      
      var socket = io(serverUrl);
      //8socket.emit('typing-with',{contactId:this.userId,chatwithid:this.activeContact._id});
      this.isButtonEnabled = true;
    }else{
      this.isButtonEnabled = false;
    }
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event) {
    let msgText  = this.msgForm.form.value.message;
    let messageVal = `${event.emoji.native}`;
    if(msgText && msgText.trim()!=''){
     messageVal = `${msgText}${event.emoji.native}`;
    }
     this.msgForm.controls['message'].setValue(messageVal);
     this.showEmojiPicker = false;
  }

  sendMessage(e) {
    if(this.msgForm.form.value.message && this.msgForm.form.value.message.trim()!='') {
      let messageVal = this.msgForm.form.value.message;
      if (e.keyCode == 13) {
        //console.log("Enter pressed " + this.msgForm.form.value.message)
        messageVal = this.msgForm.form.value.message;
     }

    if(messageVal && messageVal.trim()!='') {
        this.msgForm.reset();
        const chat: Chat = {
          contactId: this.chatService.user._id,
          chatwithid: this.activeContact._id,
          text: messageVal,
          status:'unread',
          time: new Date().toISOString()
        };
        this.chatCollection.chats.push(chat);
        this.chatService
          .updateChats(this.chatCollection._id, [...this.chatCollection.chats])
          .subscribe(res => {
            this.initMsgForm();
          });
          this.isButtonEnabled = false;
        // Only for demo purpose
        // this.chatService.autoReply({
        //   contactId: this.activeContact.id,
        //   text: `Hi, I\'m ${this.activeContact.name}. Your imaginary friend.`,
        //   time: new Date().toISOString()
        // })
     }
   }
  }

  initMsgForm() {
    setTimeout(() => {
      this.msgForm.reset();
      this.msgInput.first.nativeElement.focus();
      this.scrollToBottom();
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      this.psContainer.update();
      this.psContainer.scrollToBottom(0, 400);
    })
  }

  hideWindow() {
    this.hideWindowToggle.emit(true)
  }
}
