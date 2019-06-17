import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl,Validators, } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { EmergencyContactsComponent } from '../emergency-contacts/emergency-contacts.component';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { RelationshipType } from '../../../../selectList';
@Component({
  selector: 'app-customer-home',
  templateUrl: './emergency-contacts-details.component.html',
  styleUrls: ['./emergency-contacts-details.component.scss'],
  animations: [egretAnimations]
})
export class EmergencyContactsDetailsComponent implements OnInit {
  
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  profileIdRead = false;
  public products: any[];
  public categories: any[];
  public activeCategory: string = 'all';
  userId: string;
  selectedProfileId: string = "";
  row: any;
  modalRef: any = null;
  relationshipList: any[]
  eContactFormGroup: FormGroup;
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {
    this.relationshipList = RelationshipType;
    this.eContactFormGroup = this.fb.group({
      name: new FormControl('', Validators.required),
      relationship: new FormControl('', Validators.required),
      address: new FormControl(''),
      phone: new FormControl(''),
      mobile: new FormControl(''),
      emailAddress: new FormControl(''),
      profileId: new FormControl('')
    });

    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.userId = localStorage.getItem("endUserId");
    this.getEmergencyContactsDetails();
  }

  //function to get all events
  getEmergencyContactsDetails = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }

    this.userapi.apiRequest('post', 'customer/view-emergency-contacts', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data;               
        this.eContactFormGroup.controls['name'].setValue(this.row.name);
        this.eContactFormGroup.controls['relationship'].setValue(this.row.relationship);
        this.eContactFormGroup.controls['address'].setValue(this.row.address);
        this.eContactFormGroup.controls['phone'].setValue(this.row.phone);
        this.eContactFormGroup.controls['mobile'].setValue(this.row.mobile);
        this.eContactFormGroup.controls['emailAddress'].setValue(this.row.emailAddress);
        this.eContactFormGroup.controls['name'].setValue(this.row.name);
        this.eContactFormGroup.controls['profileId'].setValue(this.row._id);
      }
    }, (err) => {
      console.error(err)      
    })
  }

  deleteProfile() {
    var statMsg = "Are you sure you want to delete contact?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'customer/deletecontact', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              this.router.navigate(['/', 'customer', 'dashboard', 'emergency-contacts'])
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
  }

  openEmergencyModal(content: any = {}, isNew?) {
    
    let dialogRef: MatDialogRef<any> = this.dialog.open(content, {
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getEmergencyContactsDetails();
        if (!res) {
          // If user press cancel
          return;
        }
    })
  }


  eContactFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};     
    let profileIds = this.eContactFormGroup.controls['profileId'].value;
      const req_vars = {
      query: Object.assign({ _id: profileIds  }),
      proquery: Object.assign(profileInData),   
      from: Object.assign({ customerId: this.userId }) 
    }
    
    this.loader.open();     
    this.userapi.apiRequest('post', 'customer/emergency-contacts', req_vars).subscribe(result => {
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


  getType(key) {
      this.relationshipList = RelationshipType;
      let filteredTyes = this.relationshipList.filter(dtype => {
        return dtype.opt_code === key
      }).map(el => el.opt_name)[0]
      return filteredTyes
  }

  firstCapitalize(e) {
    let re = /(^|[.!?]\s+)([a-z])/g;
    var textBox: HTMLInputElement = <HTMLInputElement>e.target;
    textBox.value = textBox.value.replace(re, (m, $1, $2) => $1 + $2.toUpperCase());
  }  
  
  checkSpecialChar(event)
  {
    var key;  
    key = event.charCode;
    return((key > 64 && key < 91) || (key> 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57)); 
  }

}
