import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-coachs-corner',
  templateUrl: './coachs-corner.component.html',
  styleUrls: ['./coachs-corner.component.scss']
})
export class CoachsCornerComponent implements OnInit {

  ccData = [];
  constructor() { }

  ngOnInit() {
    this.ccData = [{
       fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
       time: 'Today',
       imgPath: '../../../../assets/images/arkenea/cc-1.png',
       info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
    },
    {
      fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
      time: 'Yesterday',
      imgPath: '../../../../assets/images/arkenea/cc-2.png',
      info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
   },
   {
    fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    time: '2 days ago',
    imgPath: '../../../../assets/images/arkenea/cc-3.png',
    info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
    },
    {
      fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
      time: '16 days ago',
      imgPath: '../../../../assets/images/arkenea/cc-1.png',
      info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
    },
    {
      fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
      time: 'Yesterday',
      imgPath: '../../../../assets/images/arkenea/cc-2.png',
      info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
   },
   {
    fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    time: '2 days ago',
    imgPath: '../../../../assets/images/arkenea/cc-3.png',
    info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
    },
    {
      fname: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry',
      time: '16 days ago',
      imgPath: '../../../../assets/images/arkenea/cc-1.png',
      info: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the lorem is industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type ipsum and crambled it to make a type specimen book. It has survived not only text ever since lorem...'
    }]
  
}

}
