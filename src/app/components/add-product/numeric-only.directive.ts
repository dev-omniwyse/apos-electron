import { Directive, Input, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumericOnly]'
})
export class NumericOnlyDirective {


  regexStr = '^(0|[1-9][0-9]*)$';
  @Input() isAlphaNumeric: boolean;

  constructor(private el?: ElementRef) { }


  @HostListener('keypress', ['$event']) onKeyPress(event) {
    return new RegExp(this.regexStr).test(event.key);
  }

}
