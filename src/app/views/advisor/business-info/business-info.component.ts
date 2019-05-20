import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { UserAPIService } from './../../../userapi.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
//import { Observable, of } from 'rxjs';
import { MatStepperModule , MatStepper} from '@angular/material/stepper';
//import { states } from '../../../state';
import { yearsOfServiceList, businessTypeList , industryDomainList, licenceHeldList } from '../../../selectList';
import { states } from '../../../state';
@Component({
  selector: 'app-business-info',
  templateUrl: './business-info.component.html',
  styleUrls: ['./business-info.component.scss']
})
export class BusinessInfoComponent implements OnInit {
  @ViewChild('stepper') private myStepper: MatStepper;
  
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  forthFormGroup: FormGroup;
  //isEditable = true;
  yearsOfServiceLists:any;
  businessTypeLists:any;
  industryDomainLists:any;
  licenceHeldLists:any;
  userId:any;
  step:any;
  profile:any;
  stateList:any;
  state_name:string;
  short_code:string;
  
  constructor(private router: Router, private activeRoute: ActivatedRoute, private stepper: MatStepperModule, private userapi: UserAPIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService) { }
  
  ngOnInit() {
    //localStorage.setItem("step",'');
    this.stateList = states;
    this.step = localStorage.getItem("step");
    this.myStepper.selectedIndex = Number(this.step);
    console.log("Step :- ",this.step,this.myStepper.selectedIndex); 
    this.yearsOfServiceLists = yearsOfServiceList;
    this.businessTypeLists = businessTypeList;
    this.industryDomainLists = industryDomainList;
    this.licenceHeldLists = licenceHeldList;
  
    this.firstFormGroup = new FormGroup({
      firstName: new FormControl('',Validators.required),
      lastName: new FormControl('',Validators.required),
      yearsOfService: new FormControl('',Validators.required),
      businessType: new FormControl('',Validators.required),
      industryDomain: new FormControl('',Validators.required)
    });
  
    this.secondFormGroup = this.fb.group({
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zipcode: new FormControl('', Validators.required),
      businessPhoneNumber: new FormControl('', Validators.required)
    });
    
    this.thirdFormGroup = this.fb.group({
      activeLicenceHeld: new FormControl('', Validators.required),
      agencyOversees: new FormControl(''),
      managingPrincipleName: new FormControl('', Validators.required),
      howManyProducers: new FormControl('', Validators.required)
    });
    this.forthFormGroup = this.fb.group({
    });
    if(this.step){
      this.getAdvDetails(this.step);
    }
  }

  /*nextStep(index: number, stepper) {  
    console.log(index)
    stepper.selectedIndex = index-1;
  }*/

  signupSubmit(steps=null,profileInData=null) {  
    console.log("Steps :- ",steps); 
   this.userId = '5cc9cc301955852c18c5b73a';

   let msgName = '';
   if(steps==1) msgName = "business information";
   else if(steps==2) msgName ="business address";
   else if(steps==3) msgName ="license information";

    var query = {};
    var proquery = {};
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "advisor" }),
      proquery: Object.assign(profileInData),
      from: Object.assign({ fromname: msgName })
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        //this.prodata = result.data.userProfile;
        localStorage.setItem("step",steps);
        console.log(steps)
        if(steps==4){console.log("here we are",steps);
          this.router.navigate(['/', 'advisor', 'thank-you']);
        }
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }

  getAdvDetails(step,query = {}){
      //console.log('here',step);
    this.userId = '5cc9cc301955852c18c5b73a';
      const req_vars = {
        query: Object.assign({ _id: this.userId, userType: "advisor" }, query)
      }
      this.loader.open();
      this.userapi.apiRequest('post', 'userlist/getprofile', req_vars).subscribe(result => {
       if (result.status == "error") {
          this.profile = [];
          this.loader.close();
        } else {
          this.profile = result.data.userProfile;//console.log('here',this.profile);

          this.firstFormGroup.controls['firstName'].setValue(this.profile.firstName);
          this.firstFormGroup.controls['lastName'].setValue(this.profile.lastName);
          this.firstFormGroup.controls['yearsOfService'].setValue(this.profile.yearsOfService);
          this.firstFormGroup.controls['businessType'].setValue(this.profile.businessType);
          this.firstFormGroup.controls['industryDomain'].setValue(this.profile.industryDomain);

          this.secondFormGroup.controls['addressLine1'].setValue(this.profile.addressLine1);
          this.secondFormGroup.controls['addressLine2'].setValue(this.profile.addressLine2);
          this.secondFormGroup.controls['zipcode'].setValue(this.profile.zipcode);
          this.secondFormGroup.controls['city'].setValue(this.profile.city);
          this.secondFormGroup.controls['state'].setValue(this.profile.state);
          this.secondFormGroup.controls['businessPhoneNumber'].setValue(this.profile.businessPhoneNumber);

          this.thirdFormGroup.controls['activeLicenceHeld'].setValue(this.profile.activeLicenceHeld);
          this.thirdFormGroup.controls['agencyOversees'].setValue(this.profile.agencyOversees);
          this.thirdFormGroup.controls['managingPrincipleName'].setValue(this.profile.managingPrincipleName);
          this.thirdFormGroup.controls['howManyProducers'].setValue(this.profile.howManyProducers);
          this.loader.close();
        }
      }, (err) => {
        console.error(err);
        this.loader.close();
      }) 
  }
}