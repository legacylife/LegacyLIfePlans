import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsAssetsComponent } from './details-assets.component';

describe('DetailsAssetsComponent', () => {
  let component: DetailsAssetsComponent;
  let fixture: ComponentFixture<DetailsAssetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailsAssetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
