import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellEmptyStateComponent } from './table-cell-empty-state';

describe('ListCellEmptyState', () => {
  let component: TableCellEmptyStateComponent;
  let fixture: ComponentFixture<TableCellEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCellEmptyStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableCellEmptyStateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
