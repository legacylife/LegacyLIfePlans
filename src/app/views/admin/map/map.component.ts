import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  zoom = 6;
  mapCenter = {
    lat: 23.806921,
    lng: 90.377078
  }
  polylinePoints = [
    { lat: 24.847916, lng: 89.369764 },
    { lat: 23.806921, lng: 90.377078 },
    { lat: 24.919298, lng: 91.831699 }
  ];
  circleMapRadius = 50000;
  aceessSection: any;

  constructor(private api: APIService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('zipcodemap')
  }

  circleMapRadiusChange(radius) {
    this.circleMapRadius = radius;
    // console.log(e)
  }
}
