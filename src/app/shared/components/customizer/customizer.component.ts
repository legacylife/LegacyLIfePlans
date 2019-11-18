import { Component, OnInit, Input } from '@angular/core';
import { NavigationService } from "../../../shared/services/navigation.service";
import { LayoutService } from '../../../shared/services/layout.service';
import PerfectScrollbar from 'perfect-scrollbar';
import { ChatService, ChatCollection, User, Chat } from "../../services/chat.service";
import { UserAPIService } from './../../../userapi.service';
import * as io from 'socket.io-client';
import { serverUrl } from './../../../config'
@Component({
  selector: 'app-customizer',
  templateUrl: './customizer.component.html',
  styleUrls: ['./customizer.component.scss']
})
export class CustomizerComponent implements OnInit {
  isCustomizerOpen: boolean = false;
  sidenavTypes = [{
    name: 'Default Menu',
    value: 'default-menu'
  }, {
    name: 'Separator Menu',
    value: 'separator-menu'
  }, {
    name: 'Icon Menu',
    value: 'icon-menu'
  }]
  layoutConf;
  selectedMenu: string = 'icon-menu';
  selectedLayout: string;
  invalidPage = true;
  isTopbarFixed = false;
  isRTL = false;
  userId : string;
  userType : string;
  unreadCount:any;
  urlData:any;
  constructor(
    private navService: NavigationService,
    private layout: LayoutService,private chatService: ChatService,private userapi: UserAPIService
  ) {}

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.userType = localStorage.getItem("endUserType");
    this.urlData = this.userapi.getURLData();
    if(this.urlData.lastOne=="advisor-subscription" || this.urlData.lastOne=="customer-subscription"){
      this.invalidPage = false;
    }
    var socket = io(serverUrl);
    socket.emit('message-unread-count',{userId:this.userId,userType:this.userType});

    this.chatService.getMessagesUnreadCnt().subscribe((count:any) => {
      if(count.length > 0){
        var totalCount = 0
        count.map((o) => { totalCount += o.unread; });
        this.unreadCount = totalCount;
        if(totalCount>99){
          this.unreadCount = totalCount+'+';
        }

        if(this.unreadCount==0){
          this.unreadCount = '';
        }
      }     
      console.log("getMessages customizer Cnt ", count)
      console.log("totalCount customizer", totalCount)

    });
   
    // let messages =this.chatService.getMessages().subscribe((message: string) => {
    //     // this.messages.push(message);
    //     console.log("thismessages",message)
    // });
    // console.log("thismessages************",messages)
   

    this.layoutConf = this.layout.layoutConf;
    this.selectedLayout = this.layoutConf.navigationPos;
    this.isTopbarFixed = this.layoutConf.topbarFixed;
    this.isRTL = this.layoutConf.dir === 'rtl';
  }
  changeLayoutStyle(data) {
    this.layout.publishLayoutChange({navigationPos: this.selectedLayout})
  }
  changeSidenav(data) {
    this.navService.publishNavigationChange(data.value)
  }
  toggleBreadcrumb(data) {
    this.layout.publishLayoutChange({breadcrumb: data.checked})
  }
  toggleTopbarFixed(data) {
    this.layout.publishLayoutChange({topbarFixed: data.checked})
  }
  toggleDir(data) {
    let dir = data.checked ? 'rtl' : 'ltr';
    this.layout.publishLayoutChange({dir: dir})
  }
}