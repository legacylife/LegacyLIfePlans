import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';
import { UserAPIService } from 'app/userapi.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';

@Component({
  selector: 'app-invite-modal',
  templateUrl: './invite-modal.component.html',
  styleUrls: ['./invite-modal.component.scss']
})
export class InviteComponent implements OnInit {
  inviteMembers: any
  inviteForm: FormGroup
  userId: string
  userFullName: string
  endUserType: string

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private snack: MatSnackBar, public dialog: MatDialog, private userapi: UserAPIService,
    private loader: AppLoaderService, private confirmService: AppConfirmService) {
  }

  ngOnInit() {
    this.userFullName = localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName");
    this.userId = localStorage.getItem("endUserId");
    this.endUserType = localStorage.getItem("endUserType");
    this.inviteForm = this.fb.group({
      inviteMembers: this.fb.array([this.fb.group({
        name: ['', Validators.required],
        email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]),
        relation: ['', Validators.required]
      })]),
    });
  }

  get inviteMembersList() {
    return this.inviteForm.get('inviteMembers') as FormArray;
  }

  addRow() {
    this.inviteMembersList.push(this.fb.group({
      name: ['', Validators.required],
      email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]),
      relation: ['', Validators.required]
    }));
  }

  delete(i) {
    const control = <FormArray>this.inviteForm.controls['inviteMembers'];
    control.removeAt(i);
  }

  inviteSubmit() {
    const inviteData = {
      data: this.inviteForm.value,
      inviteById: this.userId,
      inviteType: this.endUserType,
      inviteByFullName : this.userFullName
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'invite/invite-members', inviteData).subscribe(result => {  
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