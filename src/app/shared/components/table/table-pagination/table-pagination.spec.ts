import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePaginationComponent } from './table-pagination';

describe('TablePagination', () => {
  let component: TablePaginationComponent;
  let fixture: ComponentFixture<TablePaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablePaginationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablePaginationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
