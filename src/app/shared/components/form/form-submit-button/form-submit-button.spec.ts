// shared/components/form-submit-button/form-submit-button.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormSubmitButtonComponent } from './form-submit-button';
import { By } from '@angular/platform-browser';

describe('FormSubmitButtonComponent', () => {
  let component: FormSubmitButtonComponent;
  let fixture: ComponentFixture<FormSubmitButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSubmitButtonComponent] // Standalone bileşen olduğu için imports dizisine ekliyoruz
    }).compileComponents();

    fixture = TestBed.createComponent(FormSubmitButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // İlk render döngüsünü tetikler
  });

  // 1. Test: Bileşenin başarılı şekilde ayağa kalktığından emin olalım
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 2. Test: Varsayılan değerlerin DOM'a düzgün basıldığını doğrula (Normal durum)
  it('should render default button text and icon when not submitting', () => {
    const buttonEl = fixture.debugElement.query(By.css('button')).nativeElement;
    const iconEl = fixture.debugElement.query(By.css('i')).nativeElement;

    expect(buttonEl.textContent).toContain('Kaydet');
    expect(iconEl.className).toContain('bi bi-check-lg');
    expect(iconEl.className).not.toContain('spin'); // Varsayılan durumda dönme animasyonu olmamalı
  });

  // 3. Test: Dışarıdan özel metin ve ikon geçildiğinde doğru yansıdığını doğrula
  it('should honor custom text and icon inputs', () => {
    component.text = 'Güncelle';
    component.icon = 'bi-save';
    fixture.detectChanges(); // Değişiklikleri DOM'a yansıt

    const buttonEl = fixture.debugElement.query(By.css('button')).nativeElement;
    const iconEl = fixture.debugElement.query(By.css('i')).nativeElement;

    expect(buttonEl.textContent).toContain('Güncelle');
    expect(iconEl.className).toContain('bi bi-save');
  });

  // 4. Test: isSubmitting = true olduğunda loading modu devreye giriyor mu?
  it('should render loading text and spin icon when isSubmitting is true', () => {
    component.isSubmitting = true;
    component.loadingText = 'Kaydediliyor...';
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('button')).nativeElement;
    const iconEl = fixture.debugElement.query(By.css('i')).nativeElement;

    // Normal metin uçmalı, yerine loadingText gelmeli
    expect(buttonEl.textContent).toContain('Kaydediliyor...');
    expect(buttonEl.textContent).not.toContain('Kaydet');
    
    // İkon dönen animasyon sınıfına kavuşmalı
    expect(iconEl.className).toContain('bi bi-arrow-clockwise spin');
  });

  // 5. Test: disabled = true geçildiğinde butonun kilitlendiğini doğrula
  it('should disable the button when disabled input is true', () => {
    component.disabled = true;
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(buttonEl.disabled).toBeTrue();
  });

  // 6. Test: İstek işlenirken (isSubmitting = true) butonun otomatik kilitlendiğini doğrula
  it('should disable the button automatically when isSubmitting is true', () => {
    component.disabled = false; // Form geçerli olsa bile
    component.isSubmitting = true; // İstek gönderildiğinde
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(buttonEl.disabled).toBeTrue(); // Buton kilitlenmeli (çift tıklamayı engellemek için)
  });
});