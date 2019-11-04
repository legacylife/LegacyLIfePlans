import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuneralServiceModalComponent } from './funeral-service-modal.component';

describe('FuneralServiceModalComponent', () => {
  let component: FuneralServiceModalComponent;
  let fixture: ComponentFixture<FuneralServiceModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuneralServiceModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuneralServiceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
