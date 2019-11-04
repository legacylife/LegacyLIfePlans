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
import { DevicesList,PasswordType } from '../../../../../../selectList';

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
  passwordType: any[];
  petDocumentsList: any;
  fileErrors: any;
  deviceList: any;
  profileIdHiddenVal: boolean = false;
  selectedProfileId: string;
  lock: any;
  typeOne: boolean = false;
  typeTwo: boolean = false;
  typeThree: boolean = false;
  pattrenTemp = false;
  IsVisible: boolean = true;
  pattrenTempMissing: boolean = false;
  usernamePinMissing:boolean = false;
  usernamePasswordMissing : boolean = false;
  invalidMessage: string;
  DisplayPatternHolder = { 'visibility': 'hidden' };
  urlData:any={};	  
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  toUserId:string = ''
  subFolderName:string = ''
  LegacyPermissionError:string="You don't have access to this section";
  trusteeLegaciesAction:boolean=true;
  constructor(private snack: MatSnackBar, public dialog: MatDialog, private fb: FormBuilder, private confirmService: AppConfirmService, private loader: AppLoaderService,
    private router: Router, private userapi: UserAPIService) { }

  ngOnInit() {    

    this.userId = localStorage.getItem("endUserId");
    this.deviceListing = DevicesList;
    this.passwordType = PasswordType;
    this.DevicesForm = this.fb.group({
      deviceList: new FormControl('', Validators.required),
      deviceName: new FormControl('', Validators.required),
      username: new FormControl('',Validators.required),
      passwordType: new FormControl('', Validators.required),
      password: new FormControl(''),
      pin: new FormControl(''),
      pattrenTemp: new FormControl(''),
      profileId: new FormControl('')
    });

    this.petDocumentsList = [];
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'passwords-digital-assests' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }

    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'passwords-digital-assests') {
      this.customerLegaciesId = this.userId;
      this.customerLegacyType =  this.urlData.userType;
      this.userId = this.urlData.lastOne;          
      this.userapi.getUserAccess(this.userId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
       if(userAccess.DevicesManagement!='now'){
        this.trusteeLegaciesAction = false;
       }           
       });   
      this.selectedProfileId = "";        
    }
   
   // this.lock = new PatternLock('#patternHolder', {
    //   allowRepeat: false,
    //   radius: 22, margin: 12,
    //   //  onDraw:this.savePattren
    //   onDraw: (pattern) => {
    //     document.getElementById('patternHolder').className = 'hides1';
    //     this.setPattern(pattern, '#patternHolder7');
    //    // this.savePattren(pattern);
    //   }
    // });
  
    this.getDeviceView();
  }

   ngAfterViewInit(){
     //http://ignitersworld.com/lab/patternLock.html
      this.lock = new PatternLock('#patternHolder',{
            allowRepeat : false,
            radius: 22, margin: 12,
            onDraw: (pattern) => {
              document.getElementById('patternHolder').className = 'hides';
              this.setPattern(pattern, '#patternHolder7');
            }
        });
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
    let profileIds = this.DevicesForm.controls['profileId'].value;
    if (profileIds) {
      this.selectedProfileId = profileIds;
    }
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId, customerId: this.userId }),
      proquery: Object.assign({ passwordPattern: pattern }),
      fromId:localStorage.getItem('endUserId'),
      toId: this.userId,
      folderName:'Password & Digital Assets',
      subFolderName: 'Devices'
    }
    //this.loader.open();     
    this.userapi.apiRequest('post', 'passwordsDigitalAssets/pattern-submit', req_vars).subscribe(result => {
      // this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.lock.reset();
        this.setPattern(pattern, '#patternHolder7');
      //  this.snack.open(result.data.message, 'OK', { duration: 4000 })
        this.DevicesForm.controls['profileId'].setValue(result.data.newEntry._id);
      }
    }, (err) => {
      console.error(err)
    })
  }

  setPattern(pattern: any, ids) {
    this.lock = new PatternLock(ids, { enableSetPattern: true, radius: 22, margin: 12 });//Old margin radius: 30, margin: 20
    this.lock.setPattern(pattern);
    this.DevicesForm.controls['pattrenTemp'].setValue('1');
    this.lock.disable();
  }

  onChangePasswordType(key) {
      this.typeOne = false;
      this.typeTwo = false; 
      this.typeThree = false;
      this.IsVisible= true;
      this.lock.reset();
      if(key==1){
        this.typeOne = true;
        this.DevicesForm = this.fb.group({
          deviceList: new FormControl(this.DevicesForm.controls['deviceList'].value, Validators.required),
          deviceName: new FormControl(this.DevicesForm.controls['deviceName'].value, Validators.required),
          username: new FormControl(this.DevicesForm.controls['username'].value),
          passwordType: new FormControl(this.DevicesForm.controls['passwordType'].value, Validators.required),
          password: new FormControl(''),
          pin: new FormControl('',Validators.pattern(/^[0-9]*$/)),
          pattrenTemp: new FormControl(''),
          profileId: new FormControl(this.DevicesForm.controls['profileId'].value,)
        });                
      }else if(key==2){
        this.typeTwo = true; 
        this.DevicesForm = this.fb.group({
          deviceList: new FormControl(this.DevicesForm.controls['deviceList'].value, Validators.required),
          deviceName: new FormControl(this.DevicesForm.controls['deviceName'].value, Validators.required),
          username: new FormControl(this.DevicesForm.controls['username'].value),
          passwordType: new FormControl(this.DevicesForm.controls['passwordType'].value, Validators.required),
          password: new FormControl(''),
          pin: new FormControl('',[Validators.pattern(/^[0-9]*$/)]),
          pattrenTemp: new FormControl(''),
          profileId: new FormControl(this.DevicesForm.controls['profileId'].value,)
        });        
      }else if(key==3){
        this.IsVisible= false;        
        this.DevicesForm = this.fb.group({
          deviceList: new FormControl(this.DevicesForm.controls['deviceList'].value,Validators.required),
          deviceName: new FormControl(this.DevicesForm.controls['deviceName'].value,Validators.required),
          username: new FormControl(this.DevicesForm.controls['username'].value),
          passwordType: new FormControl(this.DevicesForm.controls['passwordType'].value,Validators.required),
          password: new FormControl(''),
          pin: new FormControl('',Validators.pattern(/^[0-9]*$/)),
          pattrenTemp: new FormControl(''),
          profileId: new FormControl(this.DevicesForm.controls['profileId'].value,)
        });            
      }
  }

  DevicesFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};
    let pattern = this.getPattern();
    
    if(this.DevicesForm.controls['passwordType'].value==3 && pattern!==''){
      this.setPattern(pattern, '#patternHolder7');
    }else{
      this.IsVisible= true;
    }
   
    if(this.DevicesForm.controls['passwordType'].value==3 && this.DevicesForm.controls['pattrenTemp'].value==''){
        this.IsVisible= false;
        this.pattrenTempMissing = true;
        this.invalidMessage = "Please draw your device pattern.";
    }
    else if(this.DevicesForm.controls['passwordType'].value==1 && this.DevicesForm.controls['username'].value.trim()=='' && this.DevicesForm.controls['password'].value.trim()==''){
      this.usernamePasswordMissing = true;
      this.invalidMessage = "Please enter username or password.";
    }
    else if(this.DevicesForm.controls['passwordType'].value==2 && this.DevicesForm.controls['username'].value.trim()=='' && this.DevicesForm.controls['pin'].value.trim()==''){
      this.usernamePinMissing = true;
      this.invalidMessage = "Please enter username or pin.";
    }
    else{
        let profileIds = this.DevicesForm.controls['profileId'].value;
        if (profileIds) {
          this.selectedProfileId = profileIds;
        }
        if(this.DevicesForm.controls['passwordType'].value=='1'){
          profileInData.pin = '';
          profileInData.passwordPattern = '';
        }else if(this.DevicesForm.controls['passwordType'].value=='2'){
          profileInData.password = '';
          profileInData.passwordPattern = '';
        }else if(this.DevicesForm.controls['passwordType'].value=='3'){
          profileInData.pin = '';
          profileInData.password = '';
          profileInData.passwordPattern = pattern;
        }

        if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'passwords-digital-assests') {
          profileInData.customerLegacyId = this.customerLegaciesId
          profileInData.customerLegacyType = this.customerLegacyType
        }
        if(!profileInData.profileId || profileInData.profileId ==''){
          profileInData.customerId = this.userId
        }

        const req_vars = {
          query: Object.assign({ _id: this.selectedProfileId}),
          proquery: Object.assign(profileInData),
          fromId:localStorage.getItem('endUserId'),
          toId: this.userId ,
          folderName:'Password & Digital Assets',
          subFolderName: 'Devices'
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
  }

  getDeviceView = (query = {}, search = false) => {
    let req_vars = {
      query: Object.assign({ customerId: this.userId, deviceList:{$ne:null}, status: "Pending" })
    }
    let profileIds = '';
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
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
          this.onChangePasswordType(this.deviceList.passwordType);
          this.DevicesForm.controls['profileId'].setValue(profileIds);
          this.DevicesForm.controls['deviceList'].setValue(this.deviceList.deviceList);
          this.DevicesForm.controls['deviceName'].setValue(this.deviceList.deviceName);
          this.DevicesForm.controls['username'].setValue(this.deviceList.username);
          this.DevicesForm.controls['password'].setValue(this.deviceList.password);
          this.DevicesForm.controls['passwordType'].setValue(this.deviceList.passwordType);
          this.DevicesForm.controls['pin'].setValue(this.deviceList.pin);    
          if(this.deviceList.passwordPattern!='' && this.deviceList.passwordType=='3'){
            this.DevicesForm.controls['pattrenTemp'].setValue('');
           //If we need to show edit the popup pattern this.setPattern(this.deviceList.passwordPattern, '#patternHolder7');
            //8this.IsVisible= false;
          }
          else {
           //8 this.IsVisible= true;
          }
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
    // document.getElementById('patternHolder7').className = 'hides';
    // document.getElementById('patternHolder').className = '';
    //http://ignitersworld.com/lab/patternLock.html
    this.lock.reset();
    this.lock.enable();    
  }

  getPattern() {
    let pattern = this.lock.getPattern();
   // console.log("Get pattern :- ",pattern);    
    return pattern;
  }
}