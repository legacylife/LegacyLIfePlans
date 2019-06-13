import { Component, OnInit } from '@angular/core';
import { MatDialogRef,MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { UserAPIService } from 'app/userapi.service';

@Component({
  selector: 'app-emergency-contacts',
  templateUrl: './emergency-contacts.component.html',
  styleUrls: ['./emergency-contacts.component.scss']
})
export class EmergencyContactsComponent implements OnInit {
  closeResult: string
  modalRef: any = null
  eContactFormGroup: FormGroup;
  showContactListing = false;
  userId: string
  eContactList: any = []
  updateContact: any = []
  selectedProfileId: string;
  constructor(private route: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private loader: AppLoaderService,
    private userapi: UserAPIService) {
  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.eContactFormGroup = this.fb.group({
      name: new FormControl('', Validators.required),
      relationship: new FormControl('',Validators.required),
      address: new FormControl(''),
      phone: new FormControl(''),
      mobile: new FormControl(''),
      emailAddress: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]),
      profileId: new FormControl('')
    });

    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    if (this.selectedProfileId && this.selectedProfileId == 'emergency-contacts') {
      this.selectedProfileId = "";
    }

    this.getEmergencyContacts()
  }

  // openModal12(content: any) {
  //   let dialogRef: MatDialogRef<any> = this.dialog.open(content, {
  //     width: '720px',
  //     disableClose: true,
  //   })    
  // }

  openModal(content: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(content, {
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getEmergencyContacts();
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
      if(profileIds){
        this.selectedProfileId = profileIds;
      }
      const req_vars = {
        query: Object.assign({ _id: this.selectedProfileId  }),
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

  getEmergencyContacts() {
    const params = {
      query: Object.assign({ "customerId": this.userId,"status":"Active"}),
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'customer/get-emergency-contacts', params).subscribe(result => {
      if (result.data.length > 0) {
        this.showContactListing = true
        this.eContactList = result.data
      }
    })

  }

}
