import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { CcShareViaEmailModelComponent } from '../cc-share-via-email-model/cc-share-via-email-model.component';
import { DataSharingService } from 'app/shared/services/data-sharing.service';

@Component({
  selector: 'app-cc-detailed-view',
  templateUrl: './cc-detailed-view.component.html',
  styleUrls: ['./cc-detailed-view.component.scss']
})
export class CcDetailedViewComponent implements OnInit {

  constructor(private dialog: MatDialog, private sharedata: DataSharingService) { }
  currentCoachId:any =''
  currentCoachData:any = ""

  ccData = [{
    _id:1,
     fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
     time: 'Today',
     imgPath: '../../../../assets/images/arkenea/cc-1.png',
     info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
  },
  {
    _id:2,
    fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    time: 'Yesterday',
    imgPath: '../../../../assets/images/arkenea/cc-2.png',
    info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
 },
 {
  _id:3,
  fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
  time: '2 days ago',
  imgPath: '../../../../assets/images/arkenea/cc-3.png',
  info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
  },
  {
    _id:4,
    fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    time: '16 days ago',
    imgPath: '../../../../assets/images/arkenea/cc-1.png',
    info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
  },
  {
    _id:5,
    fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    time: 'Yesterday',
    imgPath: '../../../../assets/images/arkenea/cc-2.png',
    info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
 },
 {
  _id:6,
  fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
  time: '2 days ago',
  imgPath: '../../../../assets/images/arkenea/cc-3.png',
  info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
  },
  {
    _id:7,
    fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    time: '16 days ago',
    imgPath: '../../../../assets/images/arkenea/cc-1.png',
    info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
  }]

  ngOnInit() {
    this.sharedata.userShareCochesSource.subscribe(message => this.currentCoachId = message)
    if(this.currentCoachId) {
      this.currentCoachData = this.ccData.find( (x)=> { return x._id==this.currentCoachId} )
    }
    console.log("currentCoachcurrentCoach",this.currentCoachId,"\n this.currentCoachData",this.currentCoachData)
  }

  openCardDetailsModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(CcShareViaEmailModelComponent, {
      width: '720px',     
    })
   
  }

}
