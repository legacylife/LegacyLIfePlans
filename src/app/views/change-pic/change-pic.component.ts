import { Component, OnInit,ViewChild } from '@angular/core';
import { APIService } from './../../api.service';
import { UserAPIService } from './../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AppConfirmService } from './../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from './../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { ImageCropperComponent, CropperSettings } from "ngx-img-cropper";
import { serverUrl, s3Details } from './../../config'
import {Buffer} from 'buffer';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
@Component({
  selector: 'app-change-pic',
  templateUrl: './change-pic.component.html',
  styleUrls: ['./change-pic.component.scss']
})
export class ChangePicComponent implements OnInit {
  userId:string;
//hasBaseDropZoneOver: any;
  data: any;  
@ViewChild('cropper', undefined)
  profilePicture: any = "assets/images/arkenea/default.jpg"
  cropperSettings: CropperSettings
  profileImage = null
  cropper: ImageCropperComponent;
  constructor( private fb: FormBuilder, private userapi: UserAPIService,private router: Router,private snack: MatSnackBar,public dialog: MatDialog,private confirmService: AppConfirmService, private loader: AppLoaderService, private picService: ProfilePicService) { 

    this.cropperSettings = new CropperSettings()
    this.cropperSettings.rounded = true
    this.cropperSettings.noFileInput = false;
    this.cropperSettings.width = 125
    this.cropperSettings.height = 125
    this.cropperSettings.croppedWidth = 125
    this.cropperSettings.croppedHeight = 125
    this.cropperSettings.canvasWidth = 400
    this.cropperSettings.canvasHeight = 350
    this.cropperSettings.cropperDrawSettings.strokeColor = '#000'
    //this.cropperSettings.preserveSize = false;
    this.data = {}
  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
  }

  fileChangeListener($event) {
    var image:any = new Image();
    var file:File = $event.target.files[0];
    var myReader:FileReader = new FileReader();
    var that = this;
    
    myReader.onloadend = function (loadEvent:any) {
        image.src = loadEvent.target.result;
        //console.log(loadEvent.target.result)
        //that.data.image = loadEvent.target.result;       
        that.cropper.setImage(image);
    };
 
    myReader.readAsDataURL(file);
}
/*
private dragFileAccepted(acceptedFile) {
 
  // Load the image in
  let fileReader = new FileReader();
  fileReader.onload = () => {

      // Set and show the image
      this.data = fileReader.result;
      // this.imageShown = true;
  };

  // Read in the file
  fileReader.readAsDataURL(acceptedFile.file);
}


public fileOverBase(e: any): void {
  this.hasBaseDropZoneOver = e;
}
*/
 saveProfilePicture() {
  this.loader.open(); 
    let profileInData = {
      profilePicture: this.data.image
    }
    var query = {}; var proquery = {};
    const req_vars = {
      query: Object.assign({ _id: this.userId}),
      proquery: Object.assign(profileInData)
    }   
    this.userapi.apiRequest('post','auth/updateProfilePic', req_vars).subscribe(result => {
      this.loader.close();
      if(result.status == "error"){
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.loader.close();
        let userHeaderDetails = sessionStorage.getItem("enduserHeaderDetails")
        let userDetails = JSON.parse(userHeaderDetails)
        userHeaderDetails = JSON.stringify(userDetails)
        if (localStorage.getItem("enduserHeaderDetails")) {
          localStorage.setItem("enduserHeaderDetails", userHeaderDetails)
          
          this.profilePicture = s3Details.url + "/" + result.data.profilePicture;
          
          console.log(this.profilePicture);

          localStorage.setItem('endUserProfilePicture', this.profilePicture)
          this.picService.setProfilePic = this.profilePicture;
          this.dialog.closeAll();
        } else {
          sessionStorage.setItem("enduserHeaderDetails", userHeaderDetails)
        }
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }


}
