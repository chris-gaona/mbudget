import { FormControl } from '@angular/forms';

export class CurrencyValidator {

  static isValid(control: FormControl) {
    var re = /^\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\.[0-9][0-9])?$/.test(control.value);

    if (re) {
      return null;
    }

    return {'invalidCurrency': true};
  }
}
