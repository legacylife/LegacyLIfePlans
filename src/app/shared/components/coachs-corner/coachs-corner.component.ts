import { Component, OnInit, EventEmitter, Output,HostListener } from '@angular/core';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { APIService } from 'app/api.service';
import { serverUrl, s3Details } from '../../../config';

@Component({
  selector: 'app-coachs-corner',
  templateUrl: './coachs-corner.component.html',
  styleUrls: ['./coachs-corner.component.scss']
})
export class CoachsCornerComponent implements OnInit {

  categoryList = []
  postList = []
  filteredPostList = []
  userType = ''
  articleImagePath = s3Details.url+'/'+s3Details.coachCornerArticlePath

  @Output() detailsLoaded: EventEmitter<boolean> = new EventEmitter();

  constructor(private sharedata: DataSharingService, private api: APIService) {
    this.userType = localStorage.getItem('endUserType')
    this.getCategoryLists()
    this.getPostLists()
  }

  ngOnInit() {    
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
      console.log('event',event)
      // if(event.srcElement.textContent=='Send an Invite'){
      // }
  }

  /**
   * @description : get all category created by system admin
   * @param query : filter params for get posts
   * @param search : search textbox input to search the posts
   */
  getCategoryLists(query = {}, search = false) {
    const req_vars = {
      query: {status:'On'},
      fields: {},
      offset: '',
      limit: '',
      order: {"createdOn": -1},
    }
    this.api.apiRequest('post', 'coach-corner-category/list', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.categoryList = [];
      }
      else {
        this.categoryList = result.data.categoryList
      }
    }, (err) => {
      console.error(err)
    })
  }

  /**
   * @description : get all posts created by system admin
   * @param query : filter params for get posts
   * @param search : search textbox input to search the posts
   */
  getPostLists(query = {}, search = false) {
    const req_vars = {
      query: {status:'On'},
      fields: {},
      offset: '',
      limit: '',
      order: {"modifiedOn": -1},
    }
    this.api.apiRequest('post', 'coach-corner-post/list', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.postList = [];
      }
      else {
        console.log('POST list',result.data.postList)
        this.postList = result.data.postList.filter((listing: any) => listing.category.status === 'On');
        this.detailsLoaded.emit(true);
      }
    }, (err) => {
      console.error(err)
    })
  }

  /**
   * @description : function for filter articles based on selection
   * @param currentTab : articles category name to view details
   */
  filterArticles( currentTab = null ) {
    if( currentTab.index > 0) {
      let category  = this.categoryList[currentTab.index-1]
      this.filteredPostList = this.postList.filter((listing: any) => listing.category.aliasName === category.aliasName);
    }
    else{
      this.getPostLists()
    }
  }
}
