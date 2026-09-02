import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRowActionsComponent } from './table-row-actions';

describe('ListRowActionsComponent', () => {
  let component: TableRowActionsComponent;
  let fixture: ComponentFixture<TableRowActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRowActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableRowActionsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
