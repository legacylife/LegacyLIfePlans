import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { UserAPIService } from 'app/userapi.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { FileUploader } from 'ng2-file-upload';
import { cloneDeep } from 'lodash'
import { serverUrl, s3Details } from 'app/config';
const URL = serverUrl + '/api/documents/invite';
const filePath = s3Details.url + '/' + s3Details.inviteDocumentsPath;

@Component({
  selector: 'app-refer-and-earn-modal',
  templateUrl: './refer-and-earn-modal.component.html',
  styleUrls: ['./refer-and-earn-modal.component.scss']
})
export class ReferAndEarnModalComponent implements OnInit {
  inviteMembers: any
  inviteForm: FormGroup
  userId: string
  userFullName: string
  endUserType: string
  exitEmails: any = []
  alreadySentEmails = ""
  invitedMembersCount = 0
  public hasBaseDropZoneOver: boolean = false;
  documents_temps = false;
  fileErrors: any;
  docPath: string;
  documentsList: any;

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private snack: MatSnackBar, public dialog: MatDialog, private userapi: UserAPIService,
    private loader: AppLoaderService, private confirmService: AppConfirmService, @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
    this.docPath = filePath;
    this.userFullName = localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName");
    this.userId = localStorage.getItem("endUserId");
    this.endUserType = localStorage.getItem("endUserType");
    this.inviteForm = this.fb.group({
      inviteMembers: this.fb.array([this.fb.group({
        name: ['', Validators.required],
        email: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        relation: ['', Validators.required]
      })]),
    });

    this.getInviteDocuments()
    this.getInviteMembersCount()
    this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
    this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  }

  get inviteMembersList() {
    return this.inviteForm.get('inviteMembers') as FormArray;
  }

  addRow() {
    this.inviteMembersList.push(this.fb.group({
      name: ['', Validators.required],
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      relation: ['', Validators.required]
    }));
  }

  delete(i) {
    const control = <FormArray>this.inviteForm.controls['inviteMembers'];
    control.removeAt(i);
    this.checkEmails()
  }

  inviteSubmit() {
    const inviteData = {
      data: this.inviteForm.value,
      inviteById: this.userId,
      inviteType: this.endUserType,
      inviteByFullName: this.userFullName
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'invite/invite-members', inviteData).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.status, 'OK', { duration: 4000 })
      } else {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
        this.dialog.closeAll();
      }
    }, (err) => {
      console.error(err)
    })
  }

  emailIdCheckInvite(pointIndex, status) {    
      let email = this.inviteForm.controls.inviteMembers.value[pointIndex].email
      const params = {
        email: email,
        inviteById: this.userId,
        inviteType: this.endUserType
      }
      this.userapi.apiRequest('post', 'invite/invite-member-check-email', params).subscribe(result => {
        if (result.data.status && !this.exitEmails.includes(email)) {
          this.exitEmails.push(email);
          this.alreadySentEmails = this.exitEmails.join(",")
        }
      })    
      this.checkEmails()
  }

  checkEmails(){
    let emailsList = []
    let formData = this.inviteForm.controls.inviteMembers.value
    formData.forEach((Obj) => {
      if (this.exitEmails.includes(Obj.email)) {
        emailsList.push(Obj.email);
      }
    })
    this.alreadySentEmails = emailsList.join(",")
  }

  getInviteMembersCount() {
    const params = {
      inviteById: this.userId,
      inviteType: 'advisor'
    }
    this.userapi.apiRequest('post', 'invite/get-invite-members-count', params).subscribe(result => {
      this.invitedMembersCount = result.data.count
    })
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
    this.fileErrors = [];
    this.uploader.queue.forEach((fileoOb) => {
      let filename = fileoOb.file.name;
      var extension = filename.substring(filename.lastIndexOf('.') + 1);
      var fileExts = ["jpg", "jpeg", "png"];
      let resp = this.isExtension(extension, fileExts);
      if (!resp) {
        var FileMsg = "This file '" + filename + "' is not supported";
        this.uploader.removeFromQueue(fileoOb);
        let pushArry = { "error": FileMsg }
        this.fileErrors.push(pushArry);
        setTimeout(() => {
          this.fileErrors = []
        }, 5000);

      }
    });

    if (this.uploader.getNotUploadedItems().length) {
      this.uploaderCopy = cloneDeep(this.uploader)
      this.uploader.queue.splice(1, this.uploader.queue.length - 1)
      this.uploaderCopy.queue.splice(0, 1)
      this.uploader.queue.forEach((fileoOb, ind) => {
        this.uploader.uploadItem(fileoOb);
      });
      this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        this.getInviteDocuments();
      };
    }
  }

  getInviteDocuments = (query = {}, search = false, uploadRemained = true) => {
    let req_vars = {
      query: Object.assign({ inviteById: this.userId, status: "Pending" }),
      fields: { _id: 1, documents: 1 }
    }
    this.userapi.apiRequest('post', 'customer/view-invite-details', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        if (uploadRemained) {
          this.uploadRemainingFiles()
        }
        this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
        this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}` });
        this.documentsList = result.data;
      }
    }, (err) => {
      console.error(err);
    })
  }

  uploadRemainingFiles() {
    this.uploaderCopy.onBeforeUploadItem = (item) => {
      item.url = `${URL}?userId=${this.userId}`;
    }
    this.uploaderCopy.queue.forEach((fileoOb, ind) => {
      this.uploaderCopy.uploadItem(fileoOb);
    });
    this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.getInviteDocuments({}, false, false);
    };
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

  deleteImage(index, docObject) {
    var statMsg = "Are you sure you want to delete '" + docObject.documents[0].title + "' file?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          this.documentsList.splice(index, 1)
          var query = {};
          const req_vars = {
            _id: Object.assign({ "_id": docObject._id }, query),
            documentName: docObject.documents[0].tmpName
          }
          this.userapi.apiRequest('post', 'documents/deleteInviteDocument', req_vars).subscribe(result => {
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

}