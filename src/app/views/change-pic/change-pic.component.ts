import { Component, ChangeDetectionStrategy, ViewChild, AfterViewInit,OnInit } from '@angular/core';
import { UserAPIService } from './../../userapi.service';
import { FormBuilder} from '@angular/forms';
import { AppConfirmService } from './../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from './../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { serverUrl, s3Details } from './../../config'
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { ImgCropperConfig, ImgCropperEvent, LyResizingCroppingImages, ImgCropperErrorEvent } from '@alyle/ui/resizing-cropping-images';
import { LyTheme2, ThemeVariables, Platform } from '@alyle/ui';
const styles = (theme: ThemeVariables) => ({
  actions: {
    display: 'flex'
  },
  cropping: {
    maxWidth: '100%',
    height: '300px'
  },
  flex: {
    flex: 1
  },
  range: {
    textAlign: 'center',
    maxWidth: '100%'
  },
  rangeInput: {
    maxWidth: '150px',
    margin: '1em 0',
    // http://brennaobrien.com/blog/2014/05/style-input-type-range-in-every-browser.html
    // removes default webkit styles
    '-webkit-appearance': 'none',
    // fix for FF unable to apply focus style bug
    border: `solid 6px ${theme.background.tertiary}`,
    // required for proper track sizing in FF
    width: '100%',
    '&::-webkit-slider-runnable-track': {
        width: '300px',
        height: '3px',
        background: '#ddd',
        border: 'none',
        borderRadius: '3px'
    },
    '&::-webkit-slider-thumb': {
        '-webkit-appearance': 'none',
        border: 'none',
        height: '16px',
        width: '16px',
        borderRadius: '50%',
        background: theme.primary.default,
        marginTop: '-6px'
    },
    '&:focus': {
        outline: 'none'
    },
    '&:focus::-webkit-slider-runnable-track': {
        background: '#ccc'
    },
    '&::-moz-range-track': {
        width: '300px',
        height: '3px',
        background: '#ddd',
        border: 'none',
        borderRadius: '3px'
    },
    '&::-moz-range-thumb': {
        border: 'none',
        height: '16px',
        width: '16px',
        borderRadius: '50%',
        background: theme.primary.default
    },

    // hide the outline behind the border
    '&:-moz-focusring': {
        outline: '1px solid white',
        outlineOffset: '-1px',
    },
    '&::-ms-track': {
        width: '300px',
        height: '3px',
        // remove bg colour from the track, we'll use ms-fill-lower and ms-fill-upper instead
        background: 'transparent',
        // leave room for the larger thumb to overflow with a transparent border
        borderColor: 'transparent',
        borderWidth: '6px 0',
        // remove default tick marks
        color: 'transparent'
    },
    '&::-ms-fill-lower': {
        background: '#777',
        borderRadius: '10px'
    },
    '&::-ms-fill-': {
        background: '#ddd',
        borderRadius: '10px',
    },
    '&::-ms-thumb': {
        border: 'none',
        height: '16px',
        width: '16px',
        borderRadius: '50%',
        background: theme.primary.default,
    },
    '&:focus::-ms-fill-lower': {
        background: '#888'
    },
    '&:focus::-ms-fill-upper': {
        background: '#ccc'
    }
  }
});

@Component({
  //selector: 'app-change-pic',
  templateUrl: './change-pic.component.html',
  styleUrls: ['./change-pic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false
})
export class ChangePicComponent implements OnInit,AfterViewInit {
  profilePicture: any = "assets/images/arkenea/dummyImglg.jpg"
  userId:string;
  classes = this.theme.addStyleSheet(styles);
  croppedImage?: string;
  result: string;

  scale: number;
  
  data: any;  
  @ViewChild(LyResizingCroppingImages) cropper: LyResizingCroppingImages;
  myConfig: ImgCropperConfig = {
    autoCrop: true,
    width: 250, // Default `250`
    height: 250, // Default `200`
    fill: '#fff', // Default transparent if type = png else #000,
    type: 'image/jpeg'
  };
  constructor( private fb: FormBuilder, private userapi: UserAPIService,private router: Router,private snack: MatSnackBar,public dialog: MatDialog,
    private confirmService: AppConfirmService,private loader: AppLoaderService, private picService: ProfilePicService,private theme: LyTheme2) { }    
  ngAfterViewInit() {
    // demo: Load image from URL and update position, scale, rotate
    // this is supported only for browsers
    if (Platform.isBrowser) {
      const config = {
        scale: 1,
        position: {
          x: 882.380608078103,
          y: 489.26357452128866
        }
      };

      // position: {
      //   x: 842.380608078103,
      //   y: 436.26357452128866
      // }
      //'https://firebasestorage.googleapis.com/v0/b/alyle-ui.appspot.com/o/img%2Flarm-rmah-47685-unsplash-1.png?alt=media&token=96a29be5-e3ef-4f71-8437-76ac8013372c'
     
      this.cropper.setImageUrl(this.profilePicture, () => {
        //cropping:center,
          this.cropper.center(),
          this.cropper.setScale(config.scale, true);
          this.cropper.updatePosition(config.position.x, config.position.y);
          // You can also rotate the image
          // this.cropper.rotate(90);
        }
      );
    }
  }


  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");

  }

  onCropped(e: ImgCropperEvent) {
    this.croppedImage = e.dataURL;
  }
  onloaded(e: ImgCropperEvent) {
   // console.log('img loaded', e);
  }
  onerror(e: ImgCropperErrorEvent) {
   // console.warn(`'${e.name}' is not a valid image`, e);
  }

  saveProfilePicture(imageData) {
     this.loader.open(); 
      let profileInData = {
        profilePicture: imageData
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
          let userHeaderDetails = sessionStorage.getItem("enduserHeaderDetails")
          let userDetails = JSON.parse(userHeaderDetails)
          userHeaderDetails = JSON.stringify(userDetails)
          this.profilePicture = s3Details.url + "/" + result.data.profilePicture;
          if (localStorage.getItem("enduserHeaderDetails")) {
            localStorage.setItem("enduserHeaderDetails", userHeaderDetails)
            localStorage.setItem('endUserProfilePicture', this.profilePicture)
            this.picService.setProfilePic = this.profilePicture;         
          } else {
            sessionStorage.setItem("enduserHeaderDetails", userHeaderDetails);
            localStorage.setItem('endUserProfilePicture', this.profilePicture)
            this.picService.setProfilePic = this.profilePicture;         
          }
          this.dialog.closeAll();
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        }
      }, (err) => {
        console.error(err)
      })
    }

}
