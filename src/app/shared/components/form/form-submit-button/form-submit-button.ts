// shared/components/form-submit-button/form-submit-button.ts
import { Component, Input,signal, inject } from '@angular/core';
import { ConfirmSubmitDirective } from '../../../directives/confirm-submit.directive'
import { SharedButtonComponent } from '../../button/button';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-form-submit-button',
  standalone: true,
  imports: [SharedButtonComponent],
  templateUrl: './form-submit-button.html', 
  styleUrl: './form-submit-button.css'
})
export class FormSubmitButtonComponent {
  private route = inject(ActivatedRoute);
  @Input() disabled: boolean = false;
  @Input() visible: boolean = true;
  
  @Input() isSubmitting: boolean = false;
  @Input() text: string = 'Kaydet';
  @Input() icon: string = 'bi-check-lg';
  @Input() loadingText: string = 'İşleniyor...';

  isViewReadonlyMode = signal<boolean>(true);
  ngOnInit(): void {  
    
    const readonlyParam = this.route.snapshot.queryParamMap.get('readonly');
    this.isViewReadonlyMode.set(readonlyParam === 'true');
  }
}