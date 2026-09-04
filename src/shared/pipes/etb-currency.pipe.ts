import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'etbCurrency',
  standalone: true,
})
export class EtbCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, digits = 2): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '-';

    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  }
}
