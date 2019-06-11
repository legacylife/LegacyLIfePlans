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

  constructor(private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private loader: AppLoaderService,
    private userapi: UserAPIService) {
  }

  ngOnInit() {
    this.eContactFormGroup = this.fb.group({
      ecName: new FormControl('', Validators.required),
      ecRelationship: new FormControl(''),
      ecAddress: new FormControl(''),
      ecPhone: new FormControl(''),
      ecMobile: new FormControl(''),
      ecEmail: new FormControl('')
    });
  }

  openModal(content: any) {
    this.modalRef = this.dialog.open(content)
  }

  eContactFormSubmit() {
    this.loader.open()
    let econtactData =  Object.assign(this.eContactFormGroup.value)
    this.userapi.apiRequest('post', 'customer/emergency_contacts', econtactData).subscribe(result => {
      this.loader.close()
      
      }, (err) => {
        console.error(err)
    })

  }

}
