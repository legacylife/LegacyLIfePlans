import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { APIService } from 'app/api.service';

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

  @Output() detailsLoaded: EventEmitter<boolean> = new EventEmitter();

  constructor(private sharedata: DataSharingService, private api: APIService) {
    this.userType = localStorage.getItem('endUserType')
    this.getCategoryLists()
    this.getPostLists()
  }

  ngOnInit() {    
  }

  /**
   * @description : get all category created by system admin
   * @param query : filter params for get posts
   * @param search : search textbox input to search the posts
   */
  getCategoryLists(query = {}, search = false) {
    const req_vars = {
      query: {},
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
      query: {},
      fields: {},
      offset: '',
      limit: '',
      order: {"createdOn": -1},
    }
    this.api.apiRequest('post', 'coach-corner-post/list', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.postList = [];
      }
      else {
        this.postList = result.data.postList
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
