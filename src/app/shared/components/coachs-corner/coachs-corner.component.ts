import { Component, OnInit } from '@angular/core';
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

  constructor(private sharedata: DataSharingService, private api: APIService) {
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
        this.sharedata.shareChochesData(this.postList[0]['_id']);
      }
    }, (err) => {
      console.error(err)
    })
  }

  /**
   * @description : function for view detailed description of the post
   * @param dataId : post ID to view details
   */
  viewDetails(dataId=null) {
    this.sharedata.shareChochesData(dataId);
  }
}
