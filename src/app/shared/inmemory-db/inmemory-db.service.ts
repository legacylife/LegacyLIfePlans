import { InMemoryDbService } from 'angular-in-memory-web-api';
import { ChatDB } from './chat-db';

export class InMemoryDataService implements InMemoryDbService {

  async createDb() {
     return { 
              'contacts': ChatDB.contacts,
              'chat-collections': ChatDB.chatCollection,
              'chat-user': ChatDB.user
            }
            
      // let contacts = [
      //   {
      //     id: "323sa680b3249760ea21rt47",
      //     name: "aaaaaaa",
      //     avatar: "assets/images/faces/13.jpg",
      //     status: "online",
      //     mood: ""
      //   },
      //   {
      //     id: "14663a3406eb47ffa63d4fec9429cb71",
      //     name: "Dinesh",
      //     avatar: "assets/images/faces/12.jpg",
      //     status: "online",
      //     mood: ""
      //   }]
      
      
      // let userId = localStorage.getItem("endUserId");
      // let req_vars = {
      //       query: Object.assign({_id: userId}),
      //     } 
      //    console.log('serverUrl',serverUrl)
      // let contacts:any = this.http.post(serverUrl + `/api/chatting/getContacts`, req_vars)
    //   return { 
    //   'contacts': contacts,//this.userapi.getUserInfo(),//
    //   'chat-collections': ChatDB.chatCollection,
    //   'chat-user': ChatDB.user
    // }
  }
}