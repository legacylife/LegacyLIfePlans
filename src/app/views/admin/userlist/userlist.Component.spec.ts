import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { userlistComponent } from './userlist.component';
import { filter-tableComponent } from './filter-table/filter-table.component';

describe('userlistComponent', () => {
  let component: userlistComponent;
  let fixture: ComponentFixture<userlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ userlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(userlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
