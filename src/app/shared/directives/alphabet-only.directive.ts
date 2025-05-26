import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appAlphabetOnly]',
  standalone: true
})
export class AlphabetOnlyDirective {

  constructor() { }
  @HostListener('keypress', ['$event']) 
  onKeyPress(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
    if (allowedKeys.includes(event.key)) return;
    
    const regex = /^[A-Za-z]$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

}
