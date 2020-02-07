import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { UserAPIService } from 'app/userapi.service';
import { Angular5Csv } from '../../../../../node_modules/angular5-csv/dist/Angular5-csv';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  zoom = 3;
  lat = -28.024; 
  long = 140.887;
  /*
    https://sites.google.com/site/gmapsdevelopment/
    'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    'http://maps.google.com/mapfiles/ms/icons/pink-dot.png',
    'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
    '/icon48.png' - Advisor,
    '/icon58.png' - Customer
  */
  
  mapCenter = []
  downloadData = []
  aceessSection: any;
  userTypeFilter:string = 'all'
  onBoardByFilter:string = 'all'

  constructor(private api: APIService, private route: ActivatedRoute, private router: Router, private userapi: UserAPIService) {
    this.getUserList( this.userTypeFilter, this.onBoardByFilter )
  }

  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('zipcodemap')
  }

  async getUserList( userType:string, onBoardBy:string ) {
    this.userTypeFilter = userType
    this.onBoardByFilter = onBoardBy
    this.mapCenter = []
    let req_var, query_var
    if( this.userTypeFilter == 'all' ) {
      query_var = { status:'Active', zipcode:{$exists:true, $ne:null} }
    }else{
      query_var = { userType: this.userTypeFilter, status:'Active', zipcode:{ $exists:true, $ne:null } }
    }
    
    if( this.onBoardByFilter == 'all' ) {
      query_var = query_var
    }
    else{
      query_var = Object.assign({ invitedByType: this.onBoardByFilter }, query_var)
    }
    req_var = { query: query_var }
      await this.userapi.apiRequest('post', 'userlist/getuserslistforadminmap', req_var).subscribe( (result) => {      
       let arrays = [];
      result.data.userDetails.forEach((element,index) => {
        if(element.location && element.location.latitude){
          let  userData = {lat: element.location.latitude,
                        long: element.location.longitude,
                        label: element.userType,
                        icon: 'http://maps.google.com/mapfiles/kml/paddle/'+(element.userType == 'customer' ? 'C.png': 'A.png'),
                        fullname: element.fullname,
                        image:'https://i1.wp.com/arkenea.com/wp-content/uploads/2018/02/company-pic2.jpg?w=1280&ssl=1',
                        address: element.address,
                        business: element.business,
                        userId: element.userId}
           this.mapCenter.push(userData)
           let  userDetails = { fullname: element.fullname,
                              email: element.email,
                              usertype: element.userType,
                              business: element.business,
                              address: element.address,
                              onBoardVia: element.onBoardVia,
                              lastLogin: element.lastLogin}
          this.downloadData.push(userDetails)
        }else{
          //arrays.push(element._id);
        }        
      });
    })
  }

  downloadAsCSV() {
    let options = { fieldSeparator: ',',
                    quoteStrings: '"',
                    decimalseparator: '.',
                    showLabels: true, 
                    showTitle: true,
                    title: 'Zip code wise user data',
                    useBom: true,
                    noDownload: false,
                    headers: ["Full Name", "Email", "Type", "Business", "Address","Onboard By","Last Login"]
                  }
    
    new Angular5Csv(this.downloadData, 'My Report',options);
  }
}
