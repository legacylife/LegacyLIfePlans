import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsVehiclesComponent } from './details-vehicles.component';

describe('DetailsVehiclesComponent', () => {
  let component: DetailsVehiclesComponent;
  let fixture: ComponentFixture<DetailsVehiclesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailsVehiclesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
