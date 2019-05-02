import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { customerlistComponent } from './customerlist.component';
import { filter-tableComponent } from './filter-table/filter-table.component';

describe('customerlistComponent', () => {
  let component: customerlistComponent;
  let fixture: ComponentFixture<customerlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ customerlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(customerlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
