import { Component, OnInit, ViewChild, ViewChildren, Input, OnDestroy } from "@angular/core";
import { PerfectScrollbarDirective } from "ngx-perfect-scrollbar";
import { ChatService, ChatCollection, User, Chat } from "../../../services/chat.service";
import { NgForm } from "@angular/forms";
import { Subscription } from 'rxjs';

@Component({
  selector: "app-chat-contents",
  templateUrl: "./chat-contents.component.html",
  styleUrls: ["./chat-contents.component.scss"]
})
export class ChatContentsComponent implements OnInit, OnDestroy {
  user: User = new User();
  activeContact: User = new User();
  public chatCollection: ChatCollection;

  userUpdateSub: Subscription;
  chatUpdateSub: Subscription;
  chatSelectSub: Subscription;
  messages: any[] = []

  @Input('matSidenav') matSidenav;
  @ViewChild(PerfectScrollbarDirective) psContainer: PerfectScrollbarDirective;

  @ViewChildren("msgInput") msgInput;
  @ViewChild("msgForm") msgForm: NgForm;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // Listen for user update
    this.userUpdateSub = this.chatService.onUserUpdated.subscribe(user => {
      //console.log('ngOnInit chat user',user)
      this.user = user;
    });

    this.chatService.getMessagesUnreadCnt().subscribe((count: string) => {
      console.log("getMessagesUnreadCnt ", count)
    });
   
    this.chatService.getMessages().subscribe((message: string) => {
        this.messages.push(message);
        console.log("thismessages", this.messages)
    });

    // Listen for contact change
    this.chatSelectSub = this.chatService.onChatSelected.subscribe(res => {
     // console.log('ngOnInit chat res',res)
      if (res) {
        this.chatCollection = res.chatCollection;
        this.activeContact = res.contact;
        this.initMsgForm();
      }
    });

    // Listen for chat update
    this.chatUpdateSub = this.chatService.onChatsUpdated.subscribe(chat => {
        this.chatCollection.chats.push(chat);
        this.scrollToBottom();
    })
  }
  
  ngOnDestroy() {
    if( this.userUpdateSub ) this.userUpdateSub.unsubscribe();
    if( this.chatSelectSub ) this.chatSelectSub.unsubscribe();
    if( this.chatUpdateSub ) this.chatUpdateSub.unsubscribe();
  }

  sendMessage(e) {
    ////chatwithid: this.activeContact._id,   
    const chat: Chat = {
      contactId: this.chatService.user._id,
      chatwithid: this.activeContact._id,
      text: this.msgForm.form.value.message,
      time: new Date().toISOString()
    };
    this.chatCollection.chats.push(chat);
    this.chatService
      .updateChats(this.chatCollection._id, [...this.chatCollection.chats])
      .subscribe(res => {
        this.initMsgForm();
      });
    
    // Only for demo purpose
    // this.chatService.autoReply({
    //   contactId: this.activeContact.id,
    //   text: `Hi, I\'m ${this.activeContact.name}. Your imaginary friend.`,
    //   time: new Date().toISOString()
    // })
    
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
}
