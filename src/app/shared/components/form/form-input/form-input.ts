// shared/components/form-input/form-input.ts
import { Component, input, inject, computed, OnInit, signal, effect } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { resolveErrorMessage } from '../../../utils/form-error.util';

const BASE_INPUT_CLASSES =
  'px-3.5 py-2.5 border rounded-lg text-[0.95rem] transition-all duration-200 ' +
  'w-full box-border focus:outline-none';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-input.html'
})
export class FormInputComponent implements OnInit {
  private translate = inject(TranslateService);

  // --- MODERN SIGNAL INPUTS ---
  formGroup = input.required<FormGroup>();
  controlName = input.required<string>();
  label = input.required<string>();

  type = input<string>('text');
  placeholder = input<string>('');
  required = input<boolean>(false);
  readonly = input<boolean>(false);
  isSubmitted = input<boolean>(false);

  private control = computed(() => this.formGroup().get(this.controlName()));

  // Reactive Forms touched/dirty/status değişikliklerini signal olarak yaymadığı için
  // bu değişiklikleri manuel bir "tick" sinyaline bağlayıp computed'ları tetikliyoruz.
  private changeTick = signal(0);

  constructor() {
    effect((onCleanup) => {
      const ctrl = this.control();
      if (!ctrl) return;

      // events: value/status/touched/dirty her değiştiğinde yayın yapar (v18+)
      const sub = ctrl.events.subscribe(() => {
        this.changeTick.update(v => v + 1);
      });

      onCleanup(() => sub.unsubscribe());
    });
  }

  ngOnInit(): void {
    const activeControl = this.control();
    if (activeControl) {
      (activeControl as any)._labelKey = this.label();
    }
  }

  isInvalid = computed(() => {
    this.changeTick(); // dependency: her control event'inde yeniden hesapla
    if (this.readonly()) return false;
    const ctrl = this.control();
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty || this.isSubmitted()));
  });

  errorMessage = computed(() => {
    this.changeTick();
    const ctrl = this.control();
    return resolveErrorMessage(ctrl?.errors, this.translate);
  });

  inputClasses = computed(() => {
    if (this.readonly()) {
      return (
        BASE_INPUT_CLASSES +
        ' border-gray-200 bg-gray-100 text-gray-500 cursor-default ' +
        'focus:ring-0 focus:border-gray-200 focus:bg-gray-100'
      );
    }

    if (this.isInvalid()) {
      return (
        BASE_INPUT_CLASSES +
        ' border-red-500 text-slate-700 bg-red-50 ' +
        'focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10 focus:bg-red-50'
      );
    }

    return (
      BASE_INPUT_CLASSES +
      ' border-slate-300 text-slate-700 bg-slate-50 ' +
      'focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/10 focus:bg-white'
    );
  });
}