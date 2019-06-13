import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
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
  showContactListing = true
  userId: string
  eContactList:any = []
  constructor(private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private loader: AppLoaderService,
    private userapi: UserAPIService) {
  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.eContactFormGroup = this.fb.group({
      ecName: new FormControl('', Validators.required),
      ecRelationship: new FormControl(''),
      ecAddress: new FormControl(''),
      ecPhone: new FormControl(''),
      ecMobile: new FormControl(''),
      ecEmail: new FormControl('')
    });
    this.getEmergencyContacts()
  }

  openModal(content: any) {
    this.modalRef = this.dialog.open(content)
  }

  eContactFormSubmit() {
    this.loader.open()
    let emergencyContactsData = this.eContactFormGroup.value
    emergencyContactsData.customerId = this.userId
    let econtactData = Object.assign(emergencyContactsData)
    this.userapi.apiRequest('post', 'customer/emergency_contacts', econtactData).subscribe(result => {
      this.loader.close()
      this.dialog.closeAll();
      this.getEmergencyContacts();
    }, (err) => {
      console.error(err)
    })
  }

  getEmergencyContacts() {
    const params = {
      query: Object.assign({ "customerId": this.userId })
    }
    this.userapi.apiRequest('post', 'customer/get_emergency_contacts', params).subscribe(result => {
      if(result.data.length > 0){
        this.showContactListing = true
        this.eContactList = result.data
      }
    })

  }

}
