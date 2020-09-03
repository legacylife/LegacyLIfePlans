import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../../userapi.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
@Component({
  selector: 'app-static-pages',
  templateUrl: './static-pages.component.html',
  styleUrls: ['./static-pages.component.scss']
})
export class StaticPagesComponent implements OnInit {

  constructor(private router: Router, private activeRoute: ActivatedRoute, private userapi: UserAPIService, private snack: MatSnackBar) { }
  pageTitle : string;
  pageBody : string;
  pageCode : string = '';
  ngOnInit() {
    this.pageTitle = '';
    this.pageBody = '';

    var pathArray = window.location.pathname.split('/');
    let urlParam = pathArray[1];

    if(urlParam == 'our-company'){
      this.pageCode = 'aboutus';
    }
    else if(urlParam == 'terms-of-use'){
      this.pageCode = 'terms';
    }
    else if(urlParam == 'privacy-policy'){
      this.pageCode = 'privacypolicy';
    }
    else if(urlParam == 'faq'){
      this.pageCode = 'faq';
    }
    else if(urlParam == 'secure-data'){
      this.pageCode = 'securedata';
    }
    
    this.getPage(this.pageCode);
  }

  getPage(pageCode) {
    const req_vars = {
      pageCode:pageCode
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
