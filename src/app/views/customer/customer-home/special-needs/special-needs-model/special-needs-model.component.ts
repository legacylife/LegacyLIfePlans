import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { MatDialog, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { UserAPIService } from 'app/userapi.service';

@Component({
  selector: 'app-special-needs-model',
  templateUrl: './special-needs-model.component.html',
  styleUrls: ['./special-needs-model.component.scss']
})
export class SpecialNeedsModelComponent implements OnInit {
  row: any
  userId: string
  specialNeedsForm: FormGroup;
  selectedProfileId: string;
  profileIdHiddenVal: boolean = false;
  folderName: any;
  folderNameHidden: string="";
  constructor(private router: Router, private snack: MatSnackBar, public dialog: MatDialog, private fb: FormBuilder, private loader: AppLoaderService,
    private userapi: UserAPIService, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.folderNameHidden = data.folderName;

    if (data.folderName == "Young_Children") {
      this.folderName = "Young Children";
    } else if (data.folderName == "Child_Parent") {
      this.folderName = "Child/Parent with Disability";
    } else {
      this.folderName = "Friend/Neighbor you provide or care for";
    }
  }
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.specialNeedsForm = this.fb.group({
      title: new FormControl('', Validators.required),
      comments: new FormControl(''),
      folderName: new FormControl(''),
      profileId: new FormControl('')
    });
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    if (this.selectedProfileId && this.selectedProfileId == 'special-needs') {
      this.selectedProfileId = "";
    }
    this.getSpecialNeedsDetails();
  }

  getSpecialNeedsDetails = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.userapi.apiRequest('post', 'specialNeeds/view-special-needs', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data
        this.specialNeedsForm.controls['profileId'].setValue(this.row._id);
        this.specialNeedsForm.controls['title'].setValue(this.row.title ? this.row.title : "");
        this.specialNeedsForm.controls['comments'].setValue(this.row.comments);
        this.specialNeedsForm.controls['folderName'].setValue(this.row.folderName);
      }
    }, (err) => {
      console.error(err)
    })
  }

  specialNeedsFormSubmit(snData) {
    var query = {};
    var proquery = {};
    let profileIds = this.specialNeedsForm.controls['profileId'].value;
    if (profileIds) {
      this.selectedProfileId = profileIds;
    }
    
    let newData = snData
    newData.folderName =  this.folderNameHidden
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }),
      proquery: Object.assign(newData),
      from: Object.assign({ customerId: this.userId })
    }    
    this.loader.open();
    this.userapi.apiRequest('post', 'specialNeeds/special-needs', req_vars).subscribe(result => {
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

  firstCapitalize(e) {
    let re = /(^|[.!?]\s+)([a-z])/g;
    var textBox: HTMLInputElement = <HTMLInputElement>e.target;
    textBox.value = textBox.value.replace(re, (m, $1, $2) => $1 + $2.toUpperCase());
  }

  checkSpecialChar(event) {
    var key;
    key = event.charCode;
    return ((key > 64 && key < 91) || (key > 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57));
  }

  trimInput(formData)
  {
    this.specialNeedsForm.controls['comments'].setValue(formData.value.comments.trim());
  }

}