import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-customer-trustees',
  templateUrl: './customer-trustees.component.html',
  styleUrls: ['./customer-trustees.component.scss']
})
export class CustomerTrusteesComponent implements OnInit {
  isAnnualSelected: boolean = false;
  
  constructor() { }

  ngOnInit() {
  }

}
