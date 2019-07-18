import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OurPlanComponent } from './our-plan.component';

describe('OurPlanComponent', () => {
  let component: OurPlanComponent;
  let fixture: ComponentFixture<OurPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OurPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OurPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
