import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud.service';
import { Result } from '../../../shared/models/results/result.model';
import {
  ProfileDto, UpdateProfileCommand, ChangePasswordCommand,
  TwoFactorSetupDto, EnableTwoFactorCommand
} from '../models/profile.model';

// CRUD deseni tam oturmadigi icin generic'leri ProfileDto ile dolduruyoruz;
// yalnizca base'in get/post/put helper'larini (interceptor + apiUrl) kullaniyoruz.
@Injectable({ providedIn: 'root' })
export class ProfileService extends BaseCrudService<
  ProfileDto, ProfileDto, ProfileDto, ProfileDto, ProfileDto> {
  protected readonly baseUrl = 'Profile';

  getProfile(): Observable<Result<ProfileDto>> {
    return this.get<Result<ProfileDto>>(`${this.baseUrl}`);
  }

  updateProfile(cmd: UpdateProfileCommand): Observable<Result<void>> {
    return this.put<Result<void>>(`${this.baseUrl}`, cmd);
  }

  changePassword(cmd: ChangePasswordCommand): Observable<Result<void>> {
    return this.put<Result<void>>(`${this.baseUrl}/ChangePassword`, cmd);
  }

  setupTwoFactor(): Observable<Result<TwoFactorSetupDto>> {
    return this.post<Result<TwoFactorSetupDto>>(`${this.baseUrl}/TwoFactor/Setup`, {});
  }

  enableTwoFactor(cmd: EnableTwoFactorCommand): Observable<Result<void>> {
    return this.post<Result<void>>(`${this.baseUrl}/TwoFactor/Enable`, cmd);
  }

  disableTwoFactor(): Observable<Result<void>> {
    return this.post<Result<void>>(`${this.baseUrl}/TwoFactor/Disable`, {});
  }
}