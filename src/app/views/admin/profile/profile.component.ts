import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatSnackBar } from '@angular/material';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { RoutePartsService } from "../../../shared/services/route-parts.service";
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  public uploader: FileUploader = new FileUploader({ url: 'upload_url' });
  public hasBaseDropZoneOver: boolean = false;

  userId: string
  userType: string = ""
  rows : any;  
  llpProfileForm: FormGroup;
  llpPasswordForm: FormGroup;

  constructor(private router: Router,private activeRoute: ActivatedRoute,private api: APIService,private fb: FormBuilder,  private snack: MatSnackBar, private loader: AppLoaderService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("userId") || sessionStorage.getItem("userId")
    this.userType = localStorage.getItem("userType") || sessionStorage.getItem("userType")
    
    if(!this.api.isLoggedIn()){
      this.router.navigate(['/', 'llp-admin', 'signin'])
    }else{ 
	 this.llpProfileForm = new FormGroup({
		  first_name: new FormControl('', Validators.required),
 		  last_name: new FormControl('', Validators.required)
	 })
	 
	 this.llpPasswordForm = new FormGroup({
		  first_name: new FormControl('', Validators.required),
 		  last_name: new FormControl('', Validators.required),
 		  country: new FormControl('', Validators.required)		  
	 })
    this.getProfile()
	}
  }
  
  //function to get all events
  getProfile = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({_id: this.userId,userType: "AdminWeb" }, query)
    }
	//this.loader.open();
    this.api.apiRequest('post', 'userlist/getprofile',req_vars).subscribe(result => {
	 //this.loader.close();
      if(result.status == "error"){
		  this.rows = [];
		  console.log(result.data)        
      } else {
		this.rows = result.data.userProfile;
		this.llpProfileForm.controls['first_name'].setValue(this.rows.first_name); 
        this.llpProfileForm.controls['last_name'].setValue(this.rows.last_name);		
      }
    }, (err) => {
      console.error(err)
    })
  }

 llpprofile (userData = null) {
    let profileInData = {
      first_name:  this.llpProfileForm.controls['first_name'].value,
      last_name: this.llpProfileForm.controls['last_name'].value,
      userType: "AdminWeb"
    }
 }
 
 llppassword (userData = null) {
    let profileInData = {
      first_name:  this.llpProfileForm.controls['first_name'].value,
      last_name: this.llpProfileForm.controls['last_name'].value,
      userType: "AdminWeb"
    }
 }
 
 public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

}
