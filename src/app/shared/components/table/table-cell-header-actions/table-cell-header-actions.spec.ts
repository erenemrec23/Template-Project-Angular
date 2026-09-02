import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellHeaderActionsComponent } from './table-cell-header-actions';

describe('ListCellHeaderActions', () => {
  let component: TableCellHeaderActionsComponent;
  let fixture: ComponentFixture<TableCellHeaderActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCellHeaderActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableCellHeaderActionsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
