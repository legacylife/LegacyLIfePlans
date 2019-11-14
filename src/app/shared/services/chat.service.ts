import { Injectable, OnInit , OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject, Subject, of, combineLatest } from "rxjs";
import { map, switchMap, catchError } from "rxjs/operators";
import { UserAPIService } from './../../userapi.service';
import * as io from 'socket.io-client';
import { serverUrl } from '../../config'
import 'rxjs/add/operator/switchMap';
export interface Chat {
  text: string;
  time: Date | string;
  contactId: User["_id"];
  chatwithid: User["chatwithid"];
}

export interface ChatCollection {
  _id: string;
  chats: Chat[];
}

export interface UserChatInfo {
  _id: ChatCollection["_id"];
  contactId: User["_id"];
  contactName: User["name"];
  unread: number;
  lastChatTime: Date | string;
}

export class User {
  _id: string;
  avatar: string;
  name: string;
  status: string;
  chatwithid:string;
  chatInfo?: UserChatInfo[];
}

@Injectable()
export class ChatService {
  userId: string
  userType: string
  public contacts: User[];
  public chats: ChatCollection[];
  public user: any;
  Contacts : any;
  private socket;    
  onContactSelected = new BehaviorSubject<any>(null);
  onUserUpdated = new Subject<User>();

  onChatSelected = new BehaviorSubject<any>(null);
  onChatsUpdated = new Subject<any>();
  private userInfo: any
  constructor(private userapi: UserAPIService,private http: HttpClient) {
    // this.loadChatData()
    this.socket = io(serverUrl)
    this.socket.on('connect', function(){
       console.log("socket connected")
    });
    this.socket.on('disconnect', function(){
     // console.log("socket disconnected",)
    });
    this.userId = localStorage.getItem("endUserId");
    this.userType = localStorage.getItem("endUserType");
    this.userInfo = this.userapi.getUserInfo();
    console.log("userInfo ",this.userInfo);
    if (this.userInfo.endUserType !== '') {
      this.userId = this.userInfo.endUserId;
      this.userType = this.userInfo.endUserType;
    }
    console.log('Welcome to chat  User Id ===> ',this.userId,' USer Type',this.userType)
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.socket.disconnect() 
  }
  loadChatData(): Observable<any> {
    return combineLatest(
      this.getAllContacts(),
      this.getAllChats(),
      this.getCurrentUser(),
      (contacts, chats, user) => {
        this.contacts = contacts;
        this.chats = chats;
        this.user = user;
       // console.log('next.willCall')
        this.onUserUpdated.next(user);
        // console.log('next.called')
        // console.log(
        //   "contacts:",
        //   contacts,
        //   "\n chats:",
        //   chats,
        //   "\n currUser:",
        //   user
        // );
      }
    );
  }
  
  public getChatByContact(contactId): Observable<ChatCollection> {
    let chatInfo = this.user.chatInfo.find(chat => chat.contactId === contactId);
    if (!chatInfo) {
      return this.createChatCollection(contactId)
        .switchMap(chatColl => {
          return this.getChatByContact(contactId)
        });
    }

    return this.getAllChats()
      .switchMap(chats => {
     let chatCollection = chats.find(chat => chat._id === chatInfo._id);
        let contact = this.contacts.find(
          contact => contact._id === contactId
        );
        this.userInfo = this.userapi.getUserInfo();
        this.userId = '';
        if (this.userInfo.endUserType !== '') {
          this.userId = this.userInfo.endUserId;
          this.userType = this.userInfo.endUserType;
        }
        this.socket.emit('get-chat-rrom',chatInfo._id,this.userId);
       // this.socket.emit('message-unread-count-',this.userId);
       this.getMessagesUnreadCnt()

        this.onChatSelected.next({
          chatCollection: chatCollection,
          contact: contact
        });
        return of(chatCollection);
      });
  }
 
  createChatCollection(contactId) {
    this.userInfo = this.userapi.getUserInfo();
    this.userId = '';
    if (this.userInfo.endUserType !== '') {
      this.userId = this.userInfo.endUserId;
      this.userType = this.userInfo.endUserType;
    }
    let contact = this.contacts.find(contact => contact._id === contactId);
    const _id = '';//(Math.random() * 1000000000).toString();
    const chatCollection: ChatCollection = {
      _id: _id,
      chats: []
    };

    let chatInfo = {
      _id: _id,
      lastChatTime: new Date(),
      contactId: contact._id,
      contactName: contact.name,
      unread: null
    };
    let req_vars = {
    query: Object.assign({_id:this.userId,userType:this.userType,contactId:contactId}),
    chatCreate: 'create',
    }

//let chatCollectiondata =  this.userapi.chatApi(`chatting/getchatCollection`,req_vars);
 return this.userapi.chatApi(`chatting/getchatCollection`,req_vars)
      .switchMap(resdata => {
        let chatInfo = {
          _id: resdata._id,
          lastChatTime: new Date(),
          avatar:resdata.avatar,
          contactId: resdata.chatwithid,
          contactName: resdata.name,
          unread: null
        };
       
       const  updatedChatCollection = {
        _id: resdata._id,
        chats: []
      };
     
    //  console.log("updatedChatCollection:",resdata,"\n chatInfo:",chatInfo);
       this.user.chatInfo.push(chatInfo);
        //this.user.chatInfo.push(chatInfo);
         return this.updateUser(this.user)
           .pipe(switchMap((res) => {
            return this.getCurrentUser().pipe(map(user => {
                this.user = user;
                this.onUserUpdated.next(user)
              }))
            // return updatedChatCollection
          }));

      });
}
  
  getAllContacts(): Observable<User[]> {
    // return this.http.get<User[]>('api/contacts');
    this.userInfo = this.userapi.getUserInfo();
    this.userId = '';
    if (this.userInfo.endUserType !== '') {
      this.userId = this.userInfo.endUserId;
      this.userType = this.userInfo.endUserType;
    }
    let req_vars = {
      query: Object.assign({_id:this.userId,userType:this.userType}),
    }
    let contacts =  this.userapi.chatApi(`chatting/getContacts`, req_vars);
   // console.log(contacts)
    return contacts;
  }

  getAllChats(): Observable<ChatCollection[]> {
   // return this.http.get<ChatCollection[]>('api/chat-collections');
    this.userInfo = this.userapi.getUserInfo();
    this.userId = '';
    if (this.userInfo.endUserType !== '') {
      this.userId = this.userInfo.endUserId;
      this.userType = this.userInfo.endUserType;
    }
    let req_vars = {
      query: Object.assign({_id:this.userId,userType:this.userType}),
    }
    let chatCollectiondata =  this.userapi.chatApi(`chatting/getchatCollection`,req_vars);
    return chatCollectiondata;
  }

  getCurrentUser(): Observable<User> {
    this.userInfo = this.userapi.getUserInfo();
    this.userId = '';
    if (this.userInfo.endUserType !== '') {
      this.userId = this.userInfo.endUserId;
      this.userType = this.userInfo.endUserType;
    }
    let req_vars = {
      query: Object.assign({_id:this.userId,userType:this.userType}),
    }
    let contacts =  this.userapi.chatApi(`chatting/getUser`, req_vars)
    .pipe(map(res => res[0]));
    return contacts;
    // return this.http.get<User>('api/chat-user')
    //   .pipe(map(res => res[0]));
  }

  updateUser(user: User): Observable<User> {
    this.userInfo = this.userapi.getUserInfo();
    this.userId = '';
    if (this.userInfo.endUserType !== '') {
      this.userId = this.userInfo.endUserId;
      this.userType = this.userInfo.endUserType;
    }
    let req_vars = {
      query: Object.assign({_id:this.userId,userType:this.userType}),
    }
    let contacts =  this.userapi.chatApi(`chatting/getUser`, req_vars)
    .pipe(map(res => res[0]));
   
    return contacts;
   //  return this.http.put<User>(`api/chat-user/${user._id}`, {...user})
  }

  public getMessagesUnreadCnt(){
    this.userInfo = this.userapi.getUserInfo();
    this.userId = '';
    if (this.userInfo.endUserType !== '') {
      this.userId = this.userInfo.endUserId;
      this.userType = this.userInfo.endUserType;
    }
    return Observable.create((observer) => {
        this.socket.on('message-unread-count-'+this.userId, (message) => {
            console.log("received message unread count :-",this.userId,message)
           // observer.next(message);
           // this.onChatsUpdated.next(message);
        });

        this.socket.on('message-unread-count'+this.userId, (message) => {
          console.log("****** received message unread count :-",message)
         // observer.next(message);
         // this.onChatsUpdated.next(message);
      });
    });
  }

  public getMessages = () => {
    this.userInfo = this.userapi.getUserInfo();
    this.userId = '';
    if (this.userInfo.endUserType !== '') {
      this.userId = this.userInfo.endUserId;
      this.userType = this.userInfo.endUserType;
    }
    return Observable.create((observer) => {
        this.socket.on('new-message-'+this.userId, (message) => {
            console.log("received message");
            observer.next(message);
            this.onChatsUpdated.next(message);
        });

        this.socket.on('message-unread-count-'+this.userId, (unreadCnt) => {
          console.log("getMessages  #@#@#  message-unread-count",this.userId,unreadCnt)        
        });
 
       this.socket.on('offlineContact', (offlineId) => {
        console.log("getMessages  #@#@#   offlineContact----",offlineId)      
       });


    });
  }
  
  updateChats(chatid: string, chats:Chat[]): Observable<ChatCollection> {
    this.userInfo = this.userapi.getUserInfo();
    this.userId = '';
    if (this.userInfo.endUserType !== '') {
      this.userId = this.userInfo.endUserId;
      this.userType = this.userInfo.endUserType;
    }
    let message = chats[0];
    if(chats.length>0){
      message =  chats[(chats.length-1)];
    }
    const chatCollection: ChatCollection = {
      _id: chatid,
      chats: chats
    }
   // console.log('message >>> ',message)
    this.socket.emit('new-message', message);
    this.socket.emit('message-unread-count', this.userId);
    //return this.http.put<ChatCollection>('api/chat-collections', chatCollection)
    let req_vars = {
      query: Object.assign({_id:chatid,userType:this.userType}),
      message:message,
    }
   
   return this.userapi.chatApi(`chatting/putMessage`,req_vars);
  }


  autoReply(chat) {
    setTimeout(() => {
      this.onChatsUpdated.next(chat)
    }, 1500);
  }
  
}