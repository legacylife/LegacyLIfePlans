import { Component, OnInit,Inject } from '@angular/core';
import { UserAPIService } from './../../../../userapi.service';
import { FormBuilder, Validators, FormControl,FormGroup } from '@angular/forms';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar,MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-send-an-email-modal',
  templateUrl: './send-an-email-modal.component.html',
  styleUrls: ['./send-an-email-modal.component.scss']
})

export class SendAnEmailComponent implements OnInit {
  sendEmailForm: FormGroup;
  userId = localStorage.getItem("endUserId");
  advisorId: string;
  constructor(  private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder,
    private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService,@Inject(MAT_DIALOG_DATA) public data: any ) { this.advisorId = data.id;}

  ngOnInit() {
    this.sendEmailForm = this.fb.group({
      name: new FormControl('',[Validators.required]),
      email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]),
      message: new FormControl('',[Validators.required])
     });
  }


  sendEmailFormSubmit(profileInData = null) {
    var query = {};  
    let req_vars = {
      query: Object.assign({customerId:this.userId,advisorId:this.advisorId}),
      proquery: Object.assign(profileInData),
    }

    this.loader.open();     
    this.userapi.apiRequest('post', 'sendMails/form-submit', req_vars).subscribe(result => {
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

  checkSpecialChar(event)
  { var key;  
    key = event.charCode;
    return((key > 64 && key < 91) || (key> 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57)); 
  }

  //function to trim the input value
  trimInput(event, colName){
    this.sendEmailForm.controls[colName].setValue(event.target.value.trim())
  }

}

