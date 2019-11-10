import { Injectable,OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject, Subject, of, combineLatest } from "rxjs";
import { map, switchMap, catchError } from "rxjs/operators";
import { UserAPIService } from './../../../userapi.service';
import * as io from 'socket.io-client';
import { serverUrl } from '../../../config'
import 'rxjs/add/operator/switchMap';
export interface Chat {
  text: string;
  time: Date | string;
  contactId: User["_id"];
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
  chatInfo?: UserChatInfo[];
}

@Injectable()
export class ChatService {
  userId = localStorage.getItem("endUserId");
  userType = localStorage.getItem("endUserType");
  public contacts: User[];
  public chats: ChatCollection[];
  public user: any;
  Contacts : any;
  private socket;    
  onContactSelected = new BehaviorSubject<any>(null);
  onUserUpdated = new Subject<User>();

  onChatSelected = new BehaviorSubject<any>(null);
  onChatsUpdated = new Subject<any>();

  constructor(private userapi: UserAPIService,private http: HttpClient) {
    // console.log('from service');
    // this.loadChatData()
    this.socket = io(serverUrl)
  }
  ngOnInit() {
      console.log('Welcome to chat ===> ',this.userId,'type',this.userType)
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
        console.log('next.willCall')
        this.onUserUpdated.next(user);
        console.log('next.called')
        console.log(
          "contacts:",
          contacts,
          "\n chats:",
          chats,
          "\n currUser:",
          user
        );
      }
    );
  }
  
  public getChatByContact(contactId): Observable<ChatCollection> {
    console.log('getChatByContact contactId',contactId)
    let chatInfo = this.user.chatInfo.find(chat => chat.contactId === contactId);
    console.log('getChatByContact chatInfo ',chatInfo)
    if (!chatInfo) {
      console.log('createChatCollection with contactId ',contactId)
      return this.createChatCollection(contactId)
        .switchMap(chatColl => {
          return this.getChatByContact(contactId)
        });
    }

    return this.getAllChats()
      .switchMap(chats => {
        console.log('getAllChats chats ',chats)
     let chatCollection = chats.find(chat => chat._id === chatInfo._id);
        console.log('getAllChats chatCollection',chatCollection)
        let contact = this.contacts.find(
          contact => contact._id === contactId
        );
    
        this.onChatSelected.next({
          chatCollection: chatCollection,
          contact: contact
        });

        console.log('onChatSelected------',this.onChatSelected);

        return of(chatCollection);
      });
  }
 
  createChatCollection(contactId) {
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
    //console.log('createChatCollection -- chatInfo',chatInfo)
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
       console.log('updatedChatCollection---',resdata,'User====',chatInfo);
       
       const  updatedChatCollection = {
        _id: resdata._id,
        chats: []
      };
     
      console.log("updatedChatCollection:",resdata,"\n chatInfo:",chatInfo);


       this.user.chatInfo.push(chatInfo);
        //this.user.chatInfo.push(chatInfo);
         return this.updateUser(this.user)
           .pipe(switchMap((res) => {
             console.log('res after chat collection ',res)
            return this.getCurrentUser().pipe(map(user => {
                this.user = user;
                 console.log('get user 142 line ',user)
                this.onUserUpdated.next(user)
              }))
            // return updatedChatCollection
          }));

      });
}
  
  getAllContacts(): Observable<User[]> {
    // return this.http.get<User[]>('api/contacts');
    let req_vars = {
      query: Object.assign({_id:this.userId,userType:this.userType}),
    }
    let contacts =  this.userapi.chatApi(`chatting/getContacts`, req_vars);
    console.log(contacts)
    return contacts;
    
    // return this.http.get<User[]>(serverUrl + `chatting/getContacts`).pipe(
    //   map(model => {
    //     console.log(model)
    //     // const items = model.data.items.filter(item => item.type === 'video');
    //     // model.data.items = items;
    //     return model
    //   }),
    //   catchError((error) => {
    //     return error
    //     console.error(error) 
    //   })
    // );
  }

  getAllChats(): Observable<ChatCollection[]> {
   // return this.http.get<ChatCollection[]>('api/chat-collections');
    let req_vars = {
      query: Object.assign({_id:this.userId,userType:this.userType}),
    }
    //,contactId:contactId
    let chatCollectiondata =  this.userapi.chatApi(`chatting/getchatCollection`,req_vars);
    console.log('getAllChats chatCollectiondata===>',chatCollectiondata)
    return chatCollectiondata;
  }

  getCurrentUser(): Observable<User> {
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
    let req_vars = {
      query: Object.assign({_id:this.userId,userType:this.userType}),
    }
    let contacts =  this.userapi.chatApi(`chatting/getUser`, req_vars)
    .pipe(map(res => res[0]));
   
    return contacts;
   //  return this.http.put<User>(`api/chat-user/${user._id}`, {...user})
  }

  
  updateChats(chatid: string, chats:Chat[]): Observable<ChatCollection> {
    let message = chats[0];
    if(chats.length>0){
      message =  chats[(chats.length-1)];
    }
    const chatCollection: ChatCollection = {
      _id: chatid,
      chats: chats
    }

    this.socket.emit('new-message', message);
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