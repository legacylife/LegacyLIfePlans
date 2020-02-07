import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { CcShareViaEmailModelComponent } from '../cc-share-via-email-model/cc-share-via-email-model.component';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { APIService } from 'app/api.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Output, EventEmitter } from '@angular/core';
import { serverUrl, s3Details } from '../../../config';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
@Component({
  selector: 'app-cc-detailed-view',
  templateUrl: './cc-detailed-view.component.html',
  styleUrls: ['./cc-detailed-view.component.scss']
})
export class CcDetailedViewComponent {
  aliasName: String = ''
  postDetails = {title:'',description:'',createdOn:'',image:{'title':"",'size':"",'extention':"",'tmpName':""}}
  userId: String = ''
  userType: String = ''
  userSubscription: Subscription;
  setupMessage = 'not set up yet';
  userIpAddress: any
  isLoggedIn: Boolean = false
  filePath = s3Details.url+'/'+s3Details.coachCornerArticlePath

  @Output() detailsLoaded: EventEmitter<boolean> = new EventEmitter();

  constructor(private dialog: MatDialog, private sharedata: DataSharingService, private api: APIService, private route: ActivatedRoute, private http: HttpClient,private loader: AppLoaderService) {
    this.userId = localStorage.getItem("endUserId")
    this.userType = localStorage.getItem("endUserType")
    this.isLoggedIn = this.userId ? true : false
    this.userSubscription = this.route.parent.params.subscribe(params => {
      this.setupComponent( params.aliasName )
    });
  }

  ngOnInit() {
  }

  setupComponent(someParam) {
    this.aliasName = someParam
    this.getPostDetails()
  }
  
  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  openCardDetailsModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(CcShareViaEmailModelComponent, {
      width: '720px',
      data: {aliasName: this.aliasName}
    })
  }

  /**
   * @description : get posts details requested by user
   * @param query : filter params for get posts
   * @param search : search textbox input to search the posts
   */
  async getPostDetails(query = {}, search = false) {
    let data = await this.http.get<{ip:string}>('https://jsonip.com').toPromise()
    this.userIpAddress = data.ip

    const req_vars = {
      query: Object.assign( {aliasName: this.aliasName}),
      fields: {},
      fromId: this.userId,
      userIpAddress: this.userIpAddress
    }
    this.loader.open();
    this.api.apiRequest('post', 'coach-corner-post/view', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.postDetails = {title:'',description:'',createdOn:'',image:{'title':"",'size':"",'extention':"",'tmpName':""}}
      }
      else {
        this.postDetails = result.data.postDetails
        this.detailsLoaded.emit(true);
      }
    }, (err) => {
      console.error(err)
    })
  }
}
