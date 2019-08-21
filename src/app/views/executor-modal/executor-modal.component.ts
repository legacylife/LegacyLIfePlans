import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { UserAPIService } from 'app/userapi.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';

@Component({
  selector: 'app-executor-modal',
  templateUrl: './executor-modal.component.html',
  styleUrls: ['./executor-modal.component.scss']
})
export class ExecutorModalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  userFullName: string
  endUserType: string
  type: string;
  docId: string;
  userid: string;
  firstName: string;
  lastName: string;
  for: string;
  heading: string;
  constructor(private router: Router, private route: ActivatedRoute, private snack: MatSnackBar, public dialog: MatDialog, private userapi: UserAPIService,
    private loader: AppLoaderService, private confirmService: AppConfirmService,@Inject(MAT_DIALOG_DATA) public data: any) {
      this.type = data.type;this.docId = data.docId;this.userid = data.userid;this.firstName = data.firstName;this.lastName = data.lastName; this.for = data.for; }
  ngOnInit() {
    this.userFullName = localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName");
    this.userId = localStorage.getItem("endUserId");
    this.endUserType = localStorage.getItem("endUserType");

      if(this.for=='setExecutor'){
          this.heading = 'Mark as an Executor';
      }else if(this.for=='removeExecutor'){
          this.heading = 'Remove as an Executor';
      }
  }

  markAsExecutor() {
    let type = this.type;let docId = this.docId;let userid = this.userid;
    let  advisorId = '';let trustId = '';
        if(type === 'advisor'){
          advisorId = userid;
          }else{
          trustId = userid;
        }
        this.loader.open();
        let req_vars = {};
        if(type == 'advisor'){
          req_vars = {customerId:localStorage.getItem("endUserId"),docId:docId,advisorId:advisorId,userType:type,legacyHolderName:this.userFullName}
        }else{   
          req_vars = {customerId:localStorage.getItem("endUserId"),docId:docId,trustId:trustId,userType:type}
        }
        this.userapi.apiRequest('post', 'executor/addAsExecutor', req_vars).subscribe(result => {
          this.loader.close();
          this.dialog.closeAll(); 
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        }, (err) => {
          console.error(err)
          this.loader.close();
        })           
        
  }

 removeAsExecutor() {
  let type = this.type;let docId = this.docId;let userid = this.userid;
  let  advisorId = '';let trustId = '';
          if(type === 'advisor'){
            advisorId = userid;
            }else{
            trustId = userid;
          }
          this.loader.open();
          let req_vars = {};
          if(type == 'advisor'){
            req_vars = {customerId:localStorage.getItem("endUserId"),docId:docId,advisorId:advisorId,userType:type,legacyHolderName:this.userFullName}
          }else{   
            req_vars = {customerId:localStorage.getItem("endUserId"),docId:docId,trustId:trustId,userType:type}
          }
          this.userapi.apiRequest('post', 'executor/removeAsExecutor', req_vars).subscribe(result => {
            this.loader.close();
            this.dialog.closeAll(); 
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          }, (err) => {
            console.error(err)
            this.loader.close();
          })           
  }

}