import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import PatternLock from 'patternlock';
import 'patternlock/dist/patternlock.css';
//import * as html2canvas from 'html2canvas/dist/html2canvas';
import { DevicesList } from '../../../../../../selectList';

//import { controlNameBinding } from '@angular/forms/src/directives/reactive_directives/form_control_name';
@Component({
  selector: 'app-devices-box',
  templateUrl: './devices-modal.component.html',
  styleUrls: ['./devices-modal.component.scss']
})
export class DevicesModalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  DevicesForm: FormGroup;
  deviceListing: any[];
  petDocumentsList: any;
  fileErrors: any;
  deviceList: any;
  profileIdHiddenVal: boolean = false;
  selectedProfileId: string;
  lock: any;
  DisplayPatternHolder = { 'visibility': 'hidden' };
  constructor(private snack: MatSnackBar, public dialog: MatDialog, private fb: FormBuilder, private confirmService: AppConfirmService, private loader: AppLoaderService,
    private router: Router, private userapi: UserAPIService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.deviceListing = DevicesList;
    this.DevicesForm = this.fb.group({
      deviceList: new FormControl('', Validators.required),
      deviceName: new FormControl(''),
      username: new FormControl(''),
      // password: new FormControl(''),
      profileId: new FormControl('')
    });

    this.petDocumentsList = [];

    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];

    if (this.selectedProfileId && this.selectedProfileId == 'passwords-digital-assests') {
      this.selectedProfileId = "";
    }

    this.lock = new PatternLock('#patternHolder', {
      allowRepeat: false,
      radius: 30, margin: 20,
      //  onDraw:this.savePattren
      onDraw: (pattern) => {
        document.getElementById('patternHolder').className = 'abc';
        this.savePattren(pattern);
      }
    });

    // this.getDeviceView();
  }

  //  ngAfterViewInit(){
  //  this.lock = new PatternLock('#patternHolder',{
  //    allowRepeat : true,
  //    radius:30,margin:20
  // });
  // this.lock = new PatternLock('#patternHolder',{
  //       allowRepeat : false,
  //       radius:30,margin:20,
  //       onDraw:this.savePattren
  //   //     onDraw:function(pattern){
  //   //         savePattren(pattern);
  //   //     }
  //   });
  // }

  savePattren(pattern: any) {
    var query = {};
    var proquery = {};
    let profileIds = '';//this.DevicesForm.controls['profileId'].value;
    if (profileIds) {
      this.selectedProfileId = profileIds;
    }
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId, customerId: this.userId }),
      proquery: Object.assign({ passwordPattern: pattern })
    }
    //this.loader.open();     
    this.userapi.apiRequest('post', 'passwordsDigitalAssets/pattern-submit', req_vars).subscribe(result => {
      // this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.lock.reset();
        this.setPattern(pattern, '#patternHolder7');
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }

  setPattern(pattern: any, ids) {//patternHolder7
    this.lock = new PatternLock(ids, { enableSetPattern: true, radius: 30, margin: 20 });
    this.lock.setPattern(pattern);
    this.lock.disable();
  }

  DevicesFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};

    let profileIds = this.DevicesForm.controls['profileId'].value;
    if (profileIds) {
      this.selectedProfileId = profileIds;
    }
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId, customerId: this.userId }),
      proquery: Object.assign(profileInData)
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'passwordsDigitalAssets/device-form-submit', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
        this.dialog.closeAll();
      }
    }, (err) => {
      console.error(err)
    })
  }

  getDeviceView = (query = {}, search = false) => {
    let req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Pending" })
    }
    let profileIds = '';
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds, customerId: this.userId })
      }
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'passwordsDigitalAssets/view-device-details', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          this.deviceList = result.data;
          let profileIds = this.deviceList._id;
          let pattern = this.deviceList.passwordPattern;
          this.DevicesForm.controls['profileId'].setValue(profileIds);
          this.setPattern(pattern, '#patternHolder');
          this.setPattern(pattern, '#patternHolder7');
          this.DevicesForm.controls['deviceList'].setValue(this.deviceList.deviceList);
          this.DevicesForm.controls['deviceName'].setValue(this.deviceList.deviceName);
          this.DevicesForm.controls['username'].setValue(this.deviceList.username);
          this.DevicesForm.controls['password'].setValue(this.deviceList.password);
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  firstCapitalize(e) {
    let re = /(^|[.!?]\s+)([a-z])/g;
    var textBox: HTMLInputElement = <HTMLInputElement>e.target;
    textBox.value = textBox.value.replace(re, (m, $1, $2) => $1 + $2.toUpperCase());
  }

  checkSpecialChar(event) {
    var key;

    key = event.charCode;
    return ((key > 64 && key < 91) || (key > 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57));
  }

  // get an screenshot 
  // getPattern1(pattern : any){
  //  html2canvas(document.getElementById('getPattern')).then(function(canvas) {
  //   document.getElementById('diplayImg').appendChild(canvas);
  //   var base64URL = canvas.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream');
  //  });
  // }

  resetPattern(event) {
    // document.getElementById('patternHolder7').className = 'abc';
    // document.getElementById('patternHolder').className = '';
    this.lock.reset()
    
  }

}