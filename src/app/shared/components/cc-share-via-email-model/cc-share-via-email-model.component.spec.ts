import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcShareViaEmailModelComponent } from './cc-share-via-email-model.component';

describe('CcShareViaEmailModelComponent', () => {
  let component: CcShareViaEmailModelComponent;
  let fixture: ComponentFixture<CcShareViaEmailModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcShareViaEmailModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcShareViaEmailModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
