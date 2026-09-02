import { Component, signal } from '@angular/core'; 

@Component({
  selector: 'app-home', 
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {

  protected readonly title = signal('TemplateProjectAngular');
}
