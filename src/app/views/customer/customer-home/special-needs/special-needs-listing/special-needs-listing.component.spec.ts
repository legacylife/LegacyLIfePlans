import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialNeedsListingComponent } from './special-needs-listing.component';

describe('SpecialNeedsListingComponent', () => {
  let component: SpecialNeedsListingComponent;
  let fixture: ComponentFixture<SpecialNeedsListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialNeedsListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialNeedsListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
