import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachsCornerComponent } from './coachs-corner.component';

describe('CoachsCornerComponent', () => {
  let component: CoachsCornerComponent;
  let fixture: ComponentFixture<CoachsCornerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachsCornerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachsCornerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
