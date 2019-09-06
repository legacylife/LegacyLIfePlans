import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { CcShareViaEmailModelComponent } from '../cc-share-via-email-model/cc-share-via-email-model.component';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { APIService } from 'app/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cc-detailed-view',
  templateUrl: './cc-detailed-view.component.html',
  styleUrls: ['./cc-detailed-view.component.scss']
})
export class CcDetailedViewComponent implements OnInit {
  aliasName: String = ''
  postDetails = {title:'',description:'',createdOn:''}

  constructor(private dialog: MatDialog, private sharedata: DataSharingService, private api: APIService, private route: ActivatedRoute) { 
    this.route.queryParams.subscribe(params => {
      console.log("params",params)
      this.aliasName = params.aliasName
    });
  }

  ngOnInit() {
    this.getPostDetails()
    /* this.sharedata.userShareCochesSource.subscribe(message => this.currentCoachId = message)
    if(this.currentCoachId) {
      this.currentCoachData = this.ccData.find( (x)=> { return x._id==this.currentCoachId} )
    } */
  }

  openCardDetailsModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(CcShareViaEmailModelComponent, {
      width: '720px',     
    })
  }

  /**
   * @description : get posts details requested by user
   * @param query : filter params for get posts
   * @param search : search textbox input to search the posts
   */
  getPostDetails(query = {}, search = false) {
    console.log("this.aliasName",this.aliasName)
    const req_vars = {
      query: Object.assign( {aliasName: this.aliasName}),
      fields: {}
    }
    this.api.apiRequest('post', 'coach-corner-post/view', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.postDetails = {title:'',description:'',createdOn:''}
      }
      else {
        this.postDetails = result.data.postDetails
      }
    }, (err) => {
      console.error(err)
    })
  }
}
