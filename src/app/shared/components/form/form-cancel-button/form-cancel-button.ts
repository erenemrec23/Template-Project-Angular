import { Component, Input, output } from '@angular/core';
import { RouterLink } from '@angular/router'; // 1. RouterLink eklendi
import { SharedButtonComponent } from '../../button/button';

@Component({
  selector: 'app-form-cancel-button',
  standalone: true,
  imports: [SharedButtonComponent, RouterLink], // 2. imports dizisine eklendi
  templateUrl: './form-cancel-button.html' 
})
export class FormCancelButtonComponent {
  @Input({ required: true }) routerLink!: string; 
  @Input() text: string = 'İptal';
  @Input() icon: string = 'bi-arrow-left';
  
  buttonClick = output<MouseEvent>();
  
  onClick(event: MouseEvent): void { 
    this.buttonClick.emit(event);
  }
}