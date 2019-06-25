import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialNeedsDetailsComponent } from './special-needs-details.component';

describe('SpecialNeedsDetailsComponent', () => {
  let component: SpecialNeedsDetailsComponent;
  let fixture: ComponentFixture<SpecialNeedsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialNeedsDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialNeedsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
