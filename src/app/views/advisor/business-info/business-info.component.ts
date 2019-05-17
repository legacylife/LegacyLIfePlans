import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { UserAPIService } from './../../../userapi.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
//import { Observable, of } from 'rxjs';
//import { MatStepperModule } from '@angular/material/stepper';
//import { states } from '../../../state';
import { yearsOfServiceList, businessTypeList , industryDomainList } from '../../../selectList';

@Component({
  selector: 'app-business-info',
  templateUrl: './business-info.component.html',
  styleUrls: ['./business-info.component.scss']
})
export class BusinessInfoComponent implements OnInit {
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  isEditable = false;
  yearsOfServiceLists:any;
  businessTypeLists:any;
  industryDomainLists:any;
  userId:any;
  step:any;

  constructor(private router: Router, private activeRoute: ActivatedRoute, private userapi: UserAPIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService) { }
  ngOnInit() {
    this.step = localStorage.getItem("step");
   
    this.yearsOfServiceLists = yearsOfServiceList;
    this.businessTypeLists = businessTypeList;
    this.industryDomainLists = industryDomainList;

    this.firstFormGroup = new FormGroup({
      firstName: new FormControl('',Validators.required),
      lastName: new FormControl('',Validators.required),
      yearsOfService: new FormControl('',Validators.required),
      businessType: new FormControl('',Validators.required),
      industryDomain: new FormControl('',Validators.required)
    });

    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required]
    });
    this.thirdFormGroup = this.fb.group({
      thirdCtrl: ['', Validators.required]
    });
    if(this.step){
      this.getAdvDetails(this.step);
    }
  }

  signupSubmit(steps=null) {  
    this.userId = '5cc9cc301955852c18c5b73a';
    let profileInData = {
      firstName: this.firstFormGroup.controls['firstName'].value,
      lastName: this.firstFormGroup.controls['lastName'].value,
      yearsOfService: this.firstFormGroup.controls['yearsOfService'].value,
      businessType: this.firstFormGroup.controls['businessType'].value,
      industryDomain: this.firstFormGroup.controls['industryDomain'].value       
    }
    var query = {};
    var proquery = {};
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "advisor" }),
      proquery: Object.assign(profileInData),
      from: Object.assign({ fromname: "business information" })
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        //this.prodata = result.data.userProfile;
        localStorage.setItem("step",steps);
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }



  getAdvDetails(step){
      //console.log('here',step);
     /* this.userId = '5cc9cc301955852c18c5b73a';
      const req_vars = {
        query: Object.assign({ _id: this.userId, userType: "advisor" }, query)
      }
      this.loader.open();
      this.userapi.apiRequest('post', 'userlist/getprofile', req_vars).subscribe(result => {
       if (result.status == "error") {
         // this.profile = [];
          this.loader.close();
        } else {
         // this.profile = result.data.userProfile;
          this.ProfileForm.controls['firstName'].setValue(this.profile.firstName);
          this.ProfileForm.controls['lastName'].setValue(this.profile.lastName);
          this.ProfileForm.controls['dateOfBirth'].setValue(this.profile.dateOfBirth);
          this.ProfileForm.controls['username'].setValue(this.profile.username);
  
          this.AddressForm.controls['businessName'].setValue(this.profile.businessName);
          this.AddressForm.controls['yearsOfService'].setValue(this.profile.yearsOfService);
          this.AddressForm.controls['businessType'].setValue(this.profile.businessType);
          this.AddressForm.controls['industryDomain'].setValue(this.profile.industryDomain);
          this.AddressForm.controls['addressLine1'].setValue(this.profile.addressLine1);
          this.AddressForm.controls['addressLine2'].setValue(this.profile.addressLine2);
          this.AddressForm.controls['city'].setValue(this.profile.city);
          this.AddressForm.controls['state'].setValue(this.profile.state);
          this.AddressForm.controls['zipcode'].setValue(this.profile.zipcode);
          this.AddressForm.controls['businessPhoneNumber'].setValue(this.profile.businessPhoneNumber);
          this.AddressForm.controls['websites'].setValue(this.profile.websites);
          this.AddressForm.controls['bioText'].setValue(this.profile.bioText);
          
          this.LicenseForm.controls['activeLicenceHeld'].setValue(this.profile.activeLicenceHeld);
          this.LicenseForm.controls['agencyOversees'].setValue(this.profile.agencyOversees);
          this.LicenseForm.controls['managingPrincipleName'].setValue(this.profile.managingPrincipleName);
          this.LicenseForm.controls['howManyProducers'].setValue(this.profile.howManyProducers);
  
  //console.log(this.profile.socialMediaLinks.facebook)
          //this.AddressForm.controls['socialMediaLinks.facebook'].setValue(this.profile.socialMediaLinks.facebook);
          //this.AddressForm.controls['socialMediaLinks.twitter'].setValue(this.profile.socialMediaLinks.twitter ? this.profile.socialMediaLinks.twitter : "");
          //this.AddressForm.controls['socialMediaLinks.linkedIn'].setValue(this.profile.socialMediaLinks.linkedIn ? this.profile.socialMediaLinks.linkedIn : "");
        //  this.AddressForm.websites: this.formBuilder.array([ this.createItem() ])
         // this.AddressForm.controls['websites'].setValue(this.profile.websites[0]);
        
          this.loader.close();
        }
      }, (err) => {
        console.error(err);
        this.loader.close();
      }) */
  }


}
