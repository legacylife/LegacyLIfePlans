import { Component, OnInit, OnDestroy, ViewChild  } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { UserAPIService } from './../../../userapi.service';
import { MatDialog,MatSnackBar, MatSidenav } from '@angular/material';
import { FormBuilder, FormGroup, FormControl,Validators,FormArray } from '@angular/forms'
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';
import { ChangePassComponent } from './change-pass/change-pass.component';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { map } from 'rxjs/operators';
import { Subscription, Observable, of  } from 'rxjs';
import { delay } from 'rxjs/operators';
import { states } from '../../../state';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl } from '../../../config';
const URL = serverUrl+'/api/documents/advisorDocument';

interface websiteLink {
  links: string;
}
@Component({
  selector: 'app-advisor-account-setting',
  templateUrl: './advisor-account-setting.component.html',
  styleUrls: ['./advisor-account-setting.component.scss'],
  animations: [egretAnimations]
})
export class AdvisorAccountSettingComponent implements OnInit {
 public uploader: FileUploader = new FileUploader({url:URL});
 public hasBaseDropZoneOver: boolean = false;
 public hasAnotherDropZoneOver:boolean = false;
  date: any;
  ProfileForm: FormGroup;
  AddressForm: FormGroup;
  LicenseForm: FormGroup;
  userId:string;
  state_name:string;
  short_code:string;
  maxDate = new Date(new Date());
  prodata:any;
  profile:any;
  stateList:any;
  awards: any;
  socialMediaLinkss: any;
  websites: [{ 'id': "",'links': "" }]
  advisorDocumentsList: any;
  websiteLinks: websiteLink[] = [{ 'links': "" }]
  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  constructor(private router: Router, private route: ActivatedRoute,private fb: FormBuilder, private snack: MatSnackBar,public dialog: MatDialog, private userapi: UserAPIService,private loader: AppLoaderService, private confirmService: AppConfirmService) { }

  ngOnInit() {
          
           this.stateList = states;
    this.userId = localStorage.getItem("endUserId");
           this.ProfileForm = this.fb.group({
            firstName: new FormControl('', Validators.required),
            lastName: new FormControl('', Validators.required),
            username: new FormControl('', Validators.required),
            phoneNumber: new FormControl('', Validators.required),
            landlineNumber: new FormControl('',),
            dateOfBirth: new FormControl('',)
          });

          this.AddressForm = this.fb.group({
            businessName: new FormControl('',Validators.required),
            yearsOfService: new FormControl(''),
            businessType: new FormControl(''),
            industryDomain: new FormControl(''),
            addressLine1: new FormControl(''),
            addressLine2: new FormControl(''),
            city: new FormControl('', Validators.required),
            state: new FormControl('', Validators.required),
            zipcode: new FormControl('', Validators.required),
            businessPhoneNumber: new FormControl(''),
            bioText: new FormControl(''),          
            websiteLinks: this.fb.array(this.websiteLinks.map(elem => this.createWebsiteGroup(elem))),
            awardsYears: this.fb.array([this.fb.group({title:['', Validators.required],year:['', Validators.required]})]),     
            
            socialMediaLinks: new FormGroup({
              facebook: new FormControl(''),
              twitter:  new FormControl(''),
              linkedIn:  new FormControl('')
            }), 
          });
          
          this.LicenseForm = this.fb.group({
            activeLicenceHeld: new FormControl('', Validators.required),
            agencyOversees: new FormControl('', Validators.required),
            managingPrincipleName: new FormControl('',),
            howManyProducers: new FormControl('',)
          });

          this.profile = [];
          this.socialMediaLinkss = [];
          this.advisorDocumentsList = [];
          this.getProfile();
          
 }
  //function to get all events
  getProfile = (query = {}, search = false) => {   
    console.log(this.userId)
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
        this.AddressForm.controls['businessType'].setValue(this.profile.businessType ? this.profile.businessType : "");
        this.AddressForm.controls['industryDomain'].setValue(this.profile.industryDomain ? this.profile.industryDomain : "");
        this.AddressForm.controls['addressLine1'].setValue(this.profile.addressLine1 ? this.profile.addressLine1 : "");
        this.AddressForm.controls['addressLine2'].setValue(this.profile.addressLine2 ? this.profile.addressLine2 : "");
        this.AddressForm.controls['city'].setValue(this.profile.city ? this.profile.city : "");
        this.AddressForm.controls['state'].setValue(this.profile.state ? this.profile.state : "");
        this.AddressForm.controls['zipcode'].setValue(this.profile.zipcode ? this.profile.zipcode : "");
        this.AddressForm.controls['bioText'].setValue(this.profile.bioText ? this.profile.bioText : "");
        this.awards = this.profile.awardsYears;
        this.websiteLinks = this.profile.websiteLinks
        this.advisorDocumentsList = this.profile.advisorDocuments;
    
        const ctrls = this.AddressForm.get('awardsYears') as FormArray;
        ctrls.removeAt(0)
        this.awards.forEach((element: any,index)=>{
            ctrls.push(this.editGroup(element.title, element.year))
        })

        const webctrls = this.AddressForm.get('websiteLinks') as FormArray;
        webctrls.removeAt(0)
        this.websiteLinks.forEach((element: any,index)=>{
          webctrls.push(this.editGroupweb(element.links))
        })
            
        const ctrl = this.getFormGroup('socialMediaLinks')
        ctrl.controls['facebook'].setValue(this.profile.socialMediaLinks ? this.profile.socialMediaLinks.facebook : "")
        ctrl.controls['twitter'].setValue(this.profile.socialMediaLinks ? this.profile.socialMediaLinks.twitter : "")
        ctrl.controls['linkedIn'].setValue(this.profile.socialMediaLinks ? this.profile.socialMediaLinks.linkedIn : "")
        this.LicenseForm.controls['activeLicenceHeld'].setValue(this.profile.activeLicenceHeld ? this.profile.activeLicenceHeld : "");
        this.LicenseForm.controls['agencyOversees'].setValue(this.profile.agencyOversees ? this.profile.agencyOversees : "");
        this.LicenseForm.controls['managingPrincipleName'].setValue(this.profile.managingPrincipleName ? this.profile.managingPrincipleName : "");
        this.LicenseForm.controls['howManyProducers'].setValue(this.profile.howManyProducers ? this.profile.howManyProducers : "");

        this.loader.close();
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
  
  get awardsPoints() {
  return this.AddressForm.get('awardsYears') as FormArray;
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
    let profileInData = {
      firstName: this.ProfileForm.controls['firstName'].value,
      lastName: this.ProfileForm.controls['lastName'].value,
      businessPhoneNumber: this.ProfileForm.controls['businessPhoneNumber'].value,
      phoneNumber: this.ProfileForm.controls['phoneNumber'].value,
      dateOfBirth: this.ProfileForm.controls['dateOfBirth'].value      
    }
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
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }

  AddressSubmit() {  
    console.log("1 :- ",this.AddressForm.value)
    const { socialMediaLinks : {facebook = '' , twitter ='' , linkedIn ='' }} = this.AddressForm.value
    console.log("2 :- ",this.AddressForm.value)
    const formNumbers = <FormArray>this.AddressForm.get('websiteLinks')
    this.websiteLinks = formNumbers.controls.map(o => { return o.value })

    console.log(this.websiteLinks)
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
      websites: this.AddressForm.controls['websites'].value,
      websiteLinks: this.websiteLinks,
      socialMediaLinks:({
        "facebook":facebook,
        "twitter": twitter,
        "linkedIn": linkedIn
      })
    }
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
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }
   
  LicenseSubmit(){
    console.log(this.LicenseForm.value)
    let LicensInData = {
      activeLicenceHeld: this.LicenseForm.controls['activeLicenceHeld'].value,
      agencyOversees: this.LicenseForm.controls['agencyOversees'].value,
      managingPrincipleName: this.LicenseForm.controls['managingPrincipleName'].value,
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
       // this.rows = result.data.userProfile;
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }


  docDelete(doc,name) {
    this.userId = '5cc9cc301955852c18c5b73a';
    var statMsg = "Are you sure you want to delete '"+name+"' file name?"

     this.confirmService.confirm({message: statMsg})
      .subscribe(res => {
        if (res) {
          this.loader.open();
          this.advisorDocumentsList.splice(doc,1)
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.userId }, query),
            proquery: Object.assign({ advisorDocuments: this.advisorDocumentsList }, query)
          }
          this.userapi.apiRequest('post', 'documents/deleteAdvDoc', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
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

  delete(i){
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
    const web = this.AddressForm.controls.websiteLinks as FormArray;
    web.push(this.fb.group({
      links: ''
    }));
  }

  deleteWebsiteLinks(i) {   
   // this.websiteLinks.splice(i, 1);
    const control = <FormArray>this.AddressForm.controls['websiteLinks'];
    control.removeAt(i);
  }

  changePasspordModal(): void {
      const dialogRef = this.dialog.open(ChangePassComponent, {
        width: '555px',
      });
      dialogRef.afterClosed().subscribe(result => {});
  }
  toggleSideNav() {
      //this.sideNav.opened = !this.sideNav.opened;
  }  
 }