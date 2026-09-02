import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPermissionsFormComponent } from './user-permission-form';

describe('UserPermission', () => {
  let component: UserPermissionsFormComponent;
  let fixture: ComponentFixture<UserPermissionsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPermissionsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPermissionsFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
