import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../../userapi.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.scss']
})
export class TermsOfUseComponent implements OnInit {

  constructor(private router: Router, private activeRoute: ActivatedRoute, private userapi: UserAPIService, private snack: MatSnackBar) { }
  pageTitle : string;
  pageBody : string;
  ngOnInit() {
    this.pageTitle = '';
    this.pageBody = '';
    this.getPage();
  }

  getPage() {
    const req_vars = {
      pageCode:'terms'
    }

    this.userapi.apiRequest('post', 'cms/view', req_vars).subscribe(result => {
      if(result.status == "error"){
      this.snack.open(result.data, 'OK', { duration: 4000 })
      } else {
        this.pageTitle = result.data.pageTitle;		
        this.pageBody = result.data.pageBody;	        
      }
    }, (err) => {
      this.snack.open(err, 'OK', { duration: 4000 })
    })
  }
}
