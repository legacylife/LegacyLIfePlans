import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealEstateModelComponent } from './real-estate-model.component';

describe('RealEstateModelComponent', () => {
  let component: RealEstateModelComponent;
  let fixture: ComponentFixture<RealEstateModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealEstateModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealEstateModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
