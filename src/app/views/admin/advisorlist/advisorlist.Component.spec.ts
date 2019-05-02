import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { advisorlistComponent } from './advisorlist.component';
import { filter-tableComponent } from './filter-table/filter-table.component';

describe('advisorlistComponent', () => {
  let component: advisorlistComponent;
  let fixture: ComponentFixture<advisorlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ advisorlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(advisorlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
