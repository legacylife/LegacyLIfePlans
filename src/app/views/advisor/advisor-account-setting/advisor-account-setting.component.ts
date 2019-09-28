import { Component, OnInit, OnDestroy, ViewChild ,HostListener} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { UserAPIService } from './../../../userapi.service';
import { MatDialog, MatSnackBar, MatSidenav, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';
import { ChangePassComponent } from './change-pass/change-pass.component';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { map, delay } from 'rxjs/operators';
import { Subscription, Observable, of } from 'rxjs';
import { states } from '../../../state';
import { FileUploader } from 'ng2-file-upload';
import { yearsOfServiceList, businessTypeList, industryDomainList, licenceHeldList, activeLicense, industryDomain, businessType, yearsOfService } from '../../../selectList';
import { serverUrl, s3Details } from '../../../config';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { ChangePicComponent } from './../../change-pic/change-pic.component';
import { CanComponentDeactivate } from '../../../shared/services/auth/can-deactivate.guard';
import { SubscriptionService } from '../../../shared/services/subscription.service';
import  * as moment  from 'moment'
import { ReferAndEarnModalComponent } from 'app/views/refer-and-earn-modal/refer-and-earn-modal.component';
//import { ReferAndEarnModalComponent } from '../legacies/refer-and-earn-modal/refer-and-earn-modal.component';

const filePath = s3Details.url+'/'+s3Details.advisorsDocumentsPath;
const URL = serverUrl + '/api/documents/advisorDocument';
interface websiteLink {
  links: string;
}
@Component({
  selector: 'app-advisor-account-setting',
  templateUrl: './advisor-account-setting.component.html',
  styleUrls: ['./advisor-account-setting.component.scss'],
  animations: [egretAnimations],
  providers: [SubscriptionService]
})
export class AdvisorAccountSettingComponent implements OnInit, CanComponentDeactivate {
  userId = localStorage.getItem("endUserId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });//,itemAlias: 'advisorDocs'
  public hasBaseDropZoneOver: boolean = false;
  public hasAnotherDropZoneOver: boolean = false;
  advisorDocumentsHide = false;
  invalidMessage: string;
  advisorDocumentsMissing: boolean = false;
  date: any;
  ProfileForm: FormGroup;
  AddressForm: FormGroup;
  LicenseForm: FormGroup;
  state_name: string;
  short_code: string;
  maxDate = new Date(new Date());
  prodata: any;
  profile: any;
  stateList: any;
  awards: any;
  socialMediaLinkss: any;
  fileErrors: any;
  websites: [{ 'id': "", 'links': "" }]
  advisorDocumentsList: any;
  awardsYears: any;
  websiteLinks: any;// websiteLink[] = [{ 'links': "" }]
  specialites: any;
  hobbies: any;
  showHowManyProducer: boolean
  advisorDocuments_temps = false;
  uploadedFile: File
  profilePicture: any = "assets/images/arkenea/default.jpg"
  activeLicenseList: string[] = activeLicense
  industryDomainList: string[] = industryDomain.sort()
  businessTypeList: string[] = businessType.sort()
  yearsOfServiceList: string[] = yearsOfService
  cityval:string
  stateval:string
  zipcodeval:string
  firstNameval:string
  lastNameval:string
  phoneval:string
  docPath:string
  invitedMembersCountDefault:string = '5'
  modified = false // display confirmation popup if user click on other link

  /**
   * Subscription variable declaration
   */
  planName: string = 'free'
  autoRenewalStatus: string = 'off'
  subscriptionExpireDate: string = ''

  isAccountFree: boolean = true
  isSubscribePlan: boolean = false
  isSubscribedBefore: boolean = false
  autoRenewalFlag: boolean = false
  autoRenewalVal:boolean = false
  isPremiumExpired: boolean = false
  isSubscriptionCanceled:boolean = false
  userCreateOn: any
  userSubscriptionDate: any
  today: Date = moment().toDate()
  currentProgessinPercent:number = 0;
  invitedMembersCount: any = 0
  remainingDays:any = 0

  targetCount:Number = 0
  extendedDays:Number = 0

  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private snack: MatSnackBar, public dialog: MatDialog, private userapi: UserAPIService,
    private loader: AppLoaderService, private confirmService: AppConfirmService, private picService: ProfilePicService, private subscriptionservice:SubscriptionService) { }

  ngOnInit() {
    const filePath = this.userId+'/'+s3Details.advisorsDocumentsPath;
    this.docPath = filePath;
    this.picService.itemValue.subscribe((nextValue) => {
      this.profilePicture = nextValue
    })
    this.stateList = states.sort();
    this.userId = localStorage.getItem("endUserId");
    this.ProfileForm = this.fb.group({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]),
      landlineNumber: new FormControl('', [Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]),
      dateOfBirth: new FormControl('', Validators.required)
    });

    this.ProfileForm.valueChanges.subscribe(val => {
      this.modified = true
    })

    this.AddressForm = this.fb.group({
      businessName: new FormControl('', Validators.required),
      yearsOfService: new FormControl('', Validators.required),
      businessType: new FormControl([], Validators.required),
      industryDomain: new FormControl([], Validators.required),
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zipcode: new FormControl('', [Validators.required, , Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)]),
      businessPhoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]),
      bioText: new FormControl('', Validators.required),
      websiteLinks: this.fb.array([this.fb.group({ links: ['', Validators.required] })]),
      awardsYears: this.fb.array([this.fb.group({ title: ['', Validators.required], year: ['', Validators.required] })]),
      specialites:  this.fb.array([this.fb.group({ name: [''] })]),
      hobbies:  this.fb.array([this.fb.group({ name: [''] })]),
      socialMediaLinks: new FormGroup({
        facebook: new FormControl(''),
        twitter: new FormControl(''),
        linkedIn: new FormControl('')
      }),
    });

    this.AddressForm.valueChanges.subscribe(val => {
      this.modified = true
    })

    this.LicenseForm = this.fb.group({
      activeLicenceHeld: new FormControl([], Validators.required),
      agencyOversees: new FormControl('', Validators.required),
      managingPrincipleName: new FormControl('', Validators.required),
      manageOtherProceducers: new FormControl('',Validators.required),
      howManyProducers: new FormControl('',[Validators.pattern(/^[0-9]*$/)]),
      advisorDocuments: new FormControl('',),
      advisorDocuments_temp: new FormControl([],Validators.required)
    });
  //  this.LicenseForm.controls['advisorDocuments_temp'].setValue('1');
    this.LicenseForm.valueChanges.subscribe(val => {
      this.modified = true
    })
  // console.log('dirty',this.LicenseForm.dirty); console.log('value',this.LicenseForm.value)

    this.profile = [];
    this.socialMediaLinkss = [];
    this.advisorDocumentsList = [];
    this.getProfile();
    this.getInviteMembersCount();

    /**
     * Check the user subscription details
     */
    this.checkSubscription()
    
  }

  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.outerText=='Invite'){
      setTimeout(()=>{     
        this.getInviteMembersCount();    
      },2000);     
    } 
  }
  checkSubscription() {
    this.subscriptionservice.checkSubscription( '', ( returnArr )=> {
      this.userCreateOn = returnArr.userCreateOn
      this.isSubscribedBefore = returnArr.isSubscribedBefore
      this.isSubscriptionCanceled = returnArr.isSubscriptionCanceled
      this.autoRenewalFlag = returnArr.autoRenewalFlag
      this.autoRenewalVal = returnArr.autoRenewalVal
      this.autoRenewalStatus = returnArr.autoRenewalStatus
      this.isAccountFree = returnArr.isAccountFree
      this.isPremiumExpired = returnArr.isPremiumExpired
      this.isSubscribePlan = returnArr.isSubscribePlan
      this.planName = returnArr.planName
      this.subscriptionExpireDate = returnArr.subscriptionExpireDate
    })
  }
  getInviteMembersCount() {
    const params = {
      inviteById: this.userId,
      inviteType: 'advisor'
    }
    this.userapi.apiRequest('post', 'invite/get-invite-members-count', params).subscribe(result => {
      this.invitedMembersCount = result.data.count
      this.remainingDays = result.data.remainingDays
      this.targetCount = result.data.targetCount
      this.extendedDays = result.data.extendedDays
    })
  }
  canDeactivate(): any {
    //return !this.ProfileForm.dirty;
    return !this.modified;
  }

  //function to get all events
  getProfile = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "advisor" }, query)
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'userlist/getprofile', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.profile = [];
        this.loader.close();
      } else {

        this.profile = result.data.userProfile;
        this.ProfileForm.controls['firstName'].setValue(this.profile.firstName ? this.profile.firstName : "");
        this.ProfileForm.controls['lastName'].setValue(this.profile.lastName ? this.profile.lastName : "");
        this.ProfileForm.controls['phoneNumber'].setValue(this.profile.phoneNumber ? this.profile.phoneNumber : "");
        this.ProfileForm.controls['landlineNumber'].setValue(this.profile.landlineNumber ? this.profile.landlineNumber : "");
        this.ProfileForm.controls['dateOfBirth'].setValue(this.profile.dateOfBirth ? this.profile.dateOfBirth : "");
        this.ProfileForm.controls['username'].setValue(this.profile.username ? this.profile.username : "");

        this.AddressForm.controls['businessName'].setValue(this.profile.businessName ? this.profile.businessName : "");
        this.AddressForm.controls['yearsOfService'].setValue(this.profile.yearsOfService ? this.profile.yearsOfService : "");
        this.AddressForm.controls['businessType'].setValue(this.profile.businessType ? this.profile.businessType : []);
        this.AddressForm.controls['industryDomain'].setValue(this.profile.industryDomain ? this.profile.industryDomain : []);
        this.AddressForm.controls['addressLine1'].setValue(this.profile.addressLine1 ? this.profile.addressLine1 : "");
        this.AddressForm.controls['addressLine2'].setValue(this.profile.addressLine2 ? this.profile.addressLine2 : "");
        this.AddressForm.controls['city'].setValue(this.profile.city ? this.profile.city : "");
        this.AddressForm.controls['state'].setValue(this.profile.state ? this.profile.state : "");
        this.AddressForm.controls['zipcode'].setValue(this.profile.zipcode ? this.profile.zipcode : "");
        this.AddressForm.controls['bioText'].setValue(this.profile.bioText ? this.profile.bioText : "");
        this.AddressForm.controls['businessPhoneNumber'].setValue(this.profile.businessPhoneNumber ? this.profile.businessPhoneNumber : "");

        this.awards = this.profile.awardsYears;
        this.websiteLinks = this.profile.websiteLinks;
        this.specialites = this.profile.specialites;
        this.hobbies = this.profile.hobbies;
        this.advisorDocumentsList = this.profile.advisorDocuments;

        this.cityval = this.profile.city ? this.profile.city : ""
        this.stateval = this.profile.state ? this.profile.state : ""
        this.zipcodeval = this.profile.zipcode ? this.profile.zipcode : ""
        this.firstNameval = this.profile.firstName ? this.profile.firstName : ""
        this.lastNameval = this.profile.lastName ? this.profile.lastName : ""
        this.phoneval = this.profile.businessPhoneNumber ? this.profile.businessPhoneNumber : ""
      
        if (this.profile.profilePicture) {
          this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + this.profile.profilePicture;
          localStorage.setItem('endUserProfilePicture', this.profilePicture)
          this.picService.setProfilePic = this.profilePicture;
        }

        const ctrls = this.AddressForm.get('awardsYears') as FormArray;
        ctrls.removeAt(0)
        this.awards.forEach((element: any, index) => {
          ctrls.push(this.editGroup(element.title, element.year))
        })

        const webctrls = this.AddressForm.get('websiteLinks') as FormArray;
        webctrls.removeAt(0)
        this.websiteLinks.forEach((element: any, index) => {
          webctrls.push(this.editGroupweb(element.links))
        })

        const specialityctrls = this.AddressForm.get('specialites') as FormArray;
        specialityctrls.removeAt(0)
        this.specialites.forEach((element: any, index) => {
          specialityctrls.push(this.editGroupspeciality(element.name))
        })

        const hobbiesctrls = this.AddressForm.get('hobbies') as FormArray;
        hobbiesctrls.removeAt(0)
        this.hobbies.forEach((element: any, index) => {
          hobbiesctrls.push(this.editGrouphobbies(element.name))
        })

        const ctrl = this.getFormGroup('socialMediaLinks')
        ctrl.controls['facebook'].setValue(this.profile.socialMediaLinks ? this.profile.socialMediaLinks.facebook : "")
        ctrl.controls['twitter'].setValue(this.profile.socialMediaLinks ? this.profile.socialMediaLinks.twitter : "")
        ctrl.controls['linkedIn'].setValue(this.profile.socialMediaLinks ? this.profile.socialMediaLinks.linkedIn : "")
        this.LicenseForm.controls['activeLicenceHeld'].setValue(this.profile.activeLicenceHeld ? this.profile.activeLicenceHeld : []);
        this.LicenseForm.controls['agencyOversees'].setValue(this.profile.agencyOversees ? this.profile.agencyOversees : "");
        this.LicenseForm.controls['managingPrincipleName'].setValue(this.profile.managingPrincipleName ? this.profile.managingPrincipleName : "");
        this.LicenseForm.controls['manageOtherProceducers'].setValue(this.profile.manageOtherProceducers ? this.profile.manageOtherProceducers : "");
        this.LicenseForm.controls['howManyProducers'].setValue(this.profile.howManyProducers ? this.profile.howManyProducers : "");

        //this.LicenseForm.controls['advisorDocuments'].setValue(this.profile.advisorDocuments ? "" : "11");

        this.LicenseForm.controls['advisorDocuments_temp'].setValue('');
        if(this.profile.advisorDocuments.length>0){
          this.LicenseForm.controls['advisorDocuments_temp'].setValue('1');
        }


        this.profile.manageOtherProceducers == 1 ? this.showHowManyProducer = true : this.showHowManyProducer = false
        this.loader.close();
        this.modified = false
      }
    }, (err) => {
      console.error(err);
      this.loader.close();
    })
  }

  editGroup(title, year) {
    return this.fb.group({
      title: [title, Validators.required],
      year: [year, Validators.required]
    });
  }

  editGroupweb(links) {
    return this.fb.group({
      links: [links, Validators.required]
    });
  }

  editGroupspeciality(name) {
    return this.fb.group({
      name: [name, Validators.required]
    });
  }

  editGrouphobbies(name) {
    return this.fb.group({
      name: [name, Validators.required]
    });
  }

  get awardsPoints() {
    return this.AddressForm.get('awardsYears') as FormArray;
  }

  get weblinksPoints() {
    return this.AddressForm.get('websiteLinks') as FormArray;
  }

  get specialitesPoints() {
    return this.AddressForm.get('specialites') as FormArray;
  }

  get hobbiesPoints() {
    return this.AddressForm.get('hobbies') as FormArray;
  }

  //function to create phone group for contact
  createWebsiteGroup(websitelink: websiteLink): FormGroup {
    return this.fb.group({
      ...websitelink,
      ...{
        links: [websitelink.links]
      }
    });
  }

  getFormGroup(controlName) {
    return <FormGroup>this.AddressForm.get(controlName);
  }

  ProfileSubmit() {
    this.modified = false
    let profileInData = {
      firstName: this.ProfileForm.controls['firstName'].value,
      lastName: this.ProfileForm.controls['lastName'].value,
      landlineNumber: this.ProfileForm.controls['landlineNumber'].value,
      phoneNumber: this.ProfileForm.controls['phoneNumber'].value,
      dateOfBirth: this.ProfileForm.controls['dateOfBirth'].value
    }

    this.firstNameval = this.ProfileForm.controls['firstName'].value
    this.lastNameval = this.ProfileForm.controls['lastName'].value

    var query = {};
    var proquery = {};
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "advisor" }),
      proquery: Object.assign(profileInData),
      from: Object.assign({ fromname: "account details" })
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        //this.prodata = result.data.userProfile;
        // localStorage.setItem("firstName", this.rows.firstName)
        // localStorage.setItem("lastName", this.rows.lastName) 
        //this.getProfile();
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }

  AddressSubmit() {
    this.modified = false
    const { socialMediaLinks: { facebook = '', twitter = '', linkedIn = '' } } = this.AddressForm.value
    const formNumbers = <FormArray>this.AddressForm.get('websiteLinks')
    this.websiteLinks = formNumbers.controls.map(o => { return o.value })

    const awardsYearsArr = <FormArray>this.AddressForm.get('awardsYears')
    this.awardsYears = awardsYearsArr.controls.map(o => { return o.value })

    const specialitesGroupArr = <FormArray>this.AddressForm.get('specialites')
    this.specialites = specialitesGroupArr.controls.map(o => { return o.value }) 

    const hobbiesGroupArr = <FormArray>this.AddressForm.get('hobbies')
    this.hobbies = hobbiesGroupArr.controls.map(o => { return o.value })

    console.log(this.AddressForm.value)
    let AddressInData = {
      addressLine1: this.AddressForm.controls['addressLine1'].value,
      addressLine2: this.AddressForm.controls['addressLine2'].value,
      city: this.AddressForm.controls['city'].value,
      state: this.AddressForm.controls['state'].value,
      zipcode: this.AddressForm.controls['zipcode'].value,
      businessName: this.AddressForm.controls['businessName'].value,
      yearsOfService: this.AddressForm.controls['yearsOfService'].value,
      businessType: this.AddressForm.controls['businessType'].value,
      industryDomain: this.AddressForm.controls['industryDomain'].value,
      businessPhoneNumber: this.AddressForm.controls['businessPhoneNumber'].value,
      bioText: this.AddressForm.controls['bioText'].value,
      websiteLinks: this.websiteLinks,
      awardsYears: this.awardsYears,
      specialites: this.specialites,
      hobbies: this.hobbies,
      socialMediaLinks: ({
        "facebook": facebook,
        "twitter": twitter,
        "linkedIn": linkedIn
      })
    }

    this.cityval = this.AddressForm.controls['city'].value
    this.stateval = this.AddressForm.controls['state'].value
    this.zipcodeval = this.AddressForm.controls['zipcode'].value
    this.phoneval = this.AddressForm.controls['businessPhoneNumber'].value
    var query = {};
    var proquery = {};
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "advisor" }),
      proquery: Object.assign(AddressInData),
      from: Object.assign({ fromname: "Business information" })
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        // this.rows = result.data.userProfile;
        //this.getProfile();
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
    this.fileErrors = [];
    this.uploader.queue.forEach((fileoOb) => {
      let filename = fileoOb.file.name;
      var extension = filename.substring(filename.lastIndexOf('.') + 1);
      var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc"];
      let resp = this.isExtension(extension,fileExts);
      if(!resp){
        var FileMsg = "This file '" + filename + "' is not supported";
        this.uploader.removeFromQueue(fileoOb);
        let pushArry = {"error":FileMsg} 
        this.fileErrors.push(pushArry); 
        setTimeout(()=>{    
          this.fileErrors = []
        }, 5000);
    
      }
    });

    if(this.uploader.getNotUploadedItems().length){
      this.uploader.uploadAll();
      //this.uploader.onAfterAddingFile = (file)=> { file.withCredentials = false; };
      this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        this.updateProgressBar();
        this.getProfileField();
      };
    }
  }

  updateProgressBar(){
    let totalLength = this.uploader.queue.length;
    let remainingLength =  this.uploader.getNotUploadedItems().length;
    this.currentProgessinPercent = 100 - (remainingLength * 100 / totalLength);
    this.currentProgessinPercent = Number(this.currentProgessinPercent.toFixed());
  }
  
  isExtension(ext, extnArray) {
    var result = false;
    var i;
    if (ext) {
        ext = ext.toLowerCase();
        for (i = 0; i < extnArray.length; i++) {
            if (extnArray[i].toLowerCase() === ext) {
                result = true;
                break;
            }
        }
    }
    return result;
}


  LicenseSubmit() {
    this.modified = false
    this.invalidMessage = '';
    /*if(this.profile.advisorDocuments || this.profile.advisorDocuments==''){ 
        this.invalidMessage = "Please upload your document";
    }*/
    // if (this.invalidMessage) {
    //   this.advisorDocumentsMissing = true;
    //   this.LicenseForm.controls['advisorDocuments'].setErrors({ 'advisorDocumentsMissing': true })
    // } else {
     // this.advisorDocumentsMissing = false;
     // this.LicenseForm.controls['advisorDocuments'].setErrors({ 'advisorDocumentsMissing': false })
      let LicensInData = {
        activeLicenceHeld: this.LicenseForm.controls['activeLicenceHeld'].value,
        agencyOversees: this.LicenseForm.controls['agencyOversees'].value,
        managingPrincipleName: this.LicenseForm.controls['managingPrincipleName'].value,
        manageOtherProceducers: this.LicenseForm.controls['manageOtherProceducers'].value,
        howManyProducers: this.LicenseForm.controls['howManyProducers'].value,
      }
      var query = {};
      var proquery = {};
      const req_vars = {
        query: Object.assign({ _id: this.userId, userType: "advisor" }),
        proquery: Object.assign(LicensInData),
        from: Object.assign({ fromname: "License & documents" })
      }
      this.loader.open();
      this.userapi.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
        this.loader.close();
        if (result.status == "error") {
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        } else {
         // this.advisorDocumentsMissing = false;
         // this.LicenseForm.controls['advisorDocuments'].setErrors({ 'advisorDocumentsMissing': false })
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        }
      }, (err) => {
        console.error(err)
      })
  //  }
  }

  docDelete(doc, name, tmName) {
    var statMsg = "Are you sure you want to delete '" + name + "' file name?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          this.advisorDocumentsList.splice(doc, 1)
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.userId }, query),
            proquery: Object.assign({ advisorDocuments: this.advisorDocumentsList }, query),
            fileName: Object.assign({ docName: tmName }, query)
          }
          this.userapi.apiRequest('post', 'documents/deleteAdvDoc', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              if(this.advisorDocumentsList.length<1){
                this.LicenseForm.controls['advisorDocuments_temp'].setValue('');
              }  
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
  }

  addNewAo() {
    this.awardsPoints.push(this.fb.group({
      title: ['', Validators.required],
      year: ['', Validators.required]
    }));
  }

  delete(i) {
    const control = <FormArray>this.AddressForm.controls['awardsYears'];
    control.removeAt(i);
    //   this.awards.splice(i,1);
  }

  addWebsitesForm() {
    return this.fb.group({
      id: '',
      links: ''
    });
  }

  addWebsiteLinks() {
    /* const web = this.AddressForm.controls.websiteLinks as FormArray;
     web.push(this.fb.group({
       links: ''
     }));*/
    this.weblinksPoints.push(this.fb.group({
      links: ['', [Validators.required, Validators.compose([CustomValidators.url])]]
    }));
  }

  deleteWebsiteLinks(i) {
    // this.websiteLinks.splice(i, 1);
    const control = <FormArray>this.AddressForm.controls['websiteLinks'];
    control.removeAt(i);
  }

  addSpecialites() {
    this.specialitesPoints.push(this.fb.group({
      name: ['', Validators.required]
    }));
  }


  addHobbies() {
    this.hobbiesPoints.push(this.fb.group({
      name: ['', [Validators.required]]
    }));
  }

  deleteSpecialites(i) {
    const control = <FormArray>this.AddressForm.controls['specialites'];
    control.removeAt(i);
  }

  deleteHobbies(i) {
    const control = <FormArray>this.AddressForm.controls['hobbies'];
    control.removeAt(i);
  }

  changePasspordModal(): void {
    const dialogRef = this.dialog.open(ChangePassComponent, {
      width: '555px',
    });
    dialogRef.afterClosed().subscribe(result => { });
  }
  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }

  /**
   * Profile upload
   */
  saveProfilePicture() {
    const fd = new FormData()
    fd.append('userId', this.userId)
    fd.append('profilePicture', this.uploadedFile, this.uploadedFile.name);
    this.userapi.apiRequest('post', 'auth/updateProfilePic', fd).subscribe((result: any) => {
      if (result.status == "success") {
        this.loader.close();
        let userHeaderDetails = sessionStorage.getItem("enduserHeaderDetails")
        let userDetails = JSON.parse(userHeaderDetails)
        userHeaderDetails = JSON.stringify(userDetails)
        if (localStorage.getItem("enduserHeaderDetails")) {
          localStorage.setItem("enduserHeaderDetails", userHeaderDetails)
        } else {
          sessionStorage.setItem("enduserHeaderDetails", userHeaderDetails)
        }
      } else {
        this.snack.open(result.data, 'OK', { duration: 4000 })
      }
    }, (err) => {
      this.snack.open(err.error.data, 'OK', { duration: 4000 })
    })
  }

  //function to show profile
  showSelectedProfilePicture() {
    let img = document.getElementById('profilePicture') as HTMLInputElement
    this.uploadedFile = img.files[0]
    const filenameArray = this.uploadedFile.name.split('.')
    const ext = filenameArray[filenameArray.length - 1].toLowerCase()
    const validExt = ['jpg', 'jpeg', 'png', 'gif']
    if (this.uploadedFile.size > 5242880) {
      this.snack.open("Profile picture must be less than 5 MB.", 'OK', { duration: 4000 })
    } else if (validExt.indexOf(ext) > -1) {
      let reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) {
          this.profilePicture = reader.result;
          localStorage.setItem('endUserProfilePicture', this.profilePicture)
          this.picService.setProfilePic = this.profilePicture;
          this.saveProfilePicture()
        }
      }
      reader.readAsDataURL(this.uploadedFile)
    } else {
      this.snack.open("Please select valid image. Valid extentions are jpg, jpeg, png, gif.", 'OK', { duration: 4000 })
    }
  }

  getProfileField = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "advisor" }, query)
    }
    this.userapi.apiRequest('post', 'userlist/getprofile', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        this.profile = result.data.userProfile;
        this.advisorDocumentsList = this.profile.advisorDocuments;
        if(this.profile.advisorDocuments.length>0){
          this.LicenseForm.controls['advisorDocuments_temp'].setValue('1');
        }
       
      }
    }, (err) => {
      console.error(err);
    })
  }

  changePicModal(): void {
    const dialogRef = this.dialog.open(ChangePicComponent, {
      width: '555px',
    });
    dialogRef.afterClosed().subscribe(result => { });
  }

  showHowManyProductsold(showVal) {
    this.LicenseForm.controls['manageOtherProceducers'].value == 2 ? this.showHowManyProducer = true : this.showHowManyProducer = false
  }

  showHowManyProducts(showVal) {
    this.showHowManyProducer = showVal === '1';
   if(!this.showHowManyProducer){
      this.LicenseForm.controls['howManyProducers'].setValue(0);
    }else{
       this.LicenseForm.controls['howManyProducers'].setValue('');
    }
    return this.showHowManyProducer    
  }

  autoRenewal() {
    if( this.autoRenewalVal ) {
      this.autoRenewalStatus = 'off'
      this.autoRenewalVal = false
    }
    else{
      this.autoRenewalStatus = 'on'
      this.autoRenewalVal = true
    }
    
    this.subscriptionservice.updateAutoRenewalStatus( this.userId, this.autoRenewalVal )
  }

  cancelSubscription= (query = {}) => {
    this.confirmService.confirm({ message: 'Are you sure you want to cancel current subscription?' }).subscribe(res => {
      if (res) {
        this.subscriptionservice.cancelSubscription( this.userId, this.isSubscriptionCanceled, (value) =>{ 
          this.isSubscriptionCanceled = value
          console.log("this.isSubscriptionCanceled",this.isSubscriptionCanceled)
          this.checkSubscription()
        })
      }
    })
  }

  
downloadFile = (filename) => {    
  let query = {};
  let req_vars = {
    query: Object.assign({ docPath: this.docPath, filename: filename }, query),
    fromId:this.userId,
    toId:this.userId,
    folderName:s3Details.advisorsDocumentsPath,
    subFolderName:''
  }
  this.snack.open("Downloading file is in process, Please wait some time!", 'OK');
  this.userapi.download('documents/downloadDocument', req_vars).subscribe(res => {
    var newBlob = new Blob([res])
    var downloadURL = window.URL.createObjectURL(newBlob);
    let filePath = downloadURL;
    var link=document.createElement('a');
    link.href = filePath;
    link.download = filename;
    document.body.appendChild(link);
    link.click(); 
    this.snack.dismiss();
  //  var newBlob = new Blob([res], {type: "application/jpg"})
  //   var downloadURL = window.URL.createObjectURL(newBlob);
  //   let filePath = downloadURL;
  //   var link=document.createElement('a');
  //   link.href = filePath;
  //   link.download = filename;
  //   document.body.appendChild(link);
  //   link.click(); 
  //   setTimeout(function(){
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(downloadURL);
  //   }, 1000);
  //   this.snack.dismiss();
  });
}

  openInviteModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ReferAndEarnModalComponent, {
      width: '720px',
      disableClose: true,
    })
  }
}