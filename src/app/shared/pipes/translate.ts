import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Signals reactive changes require live re-renders
})
export class TranslatePipe implements PipeTransform {
  private languageService = inject(LanguageService);

  transform(key: string): string {
    return this.languageService.translate(key);
  }
}
