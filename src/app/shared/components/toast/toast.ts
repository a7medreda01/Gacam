import { Component, Injectable, inject, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);
  private idCounter = 0;

  show(text: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = ++this.idCounter;
    this.toasts.update(current => [...current, { id, text, type }]);
    
    // Auto-dimish in 4.5 seconds
    setTimeout(() => {
      this.toasts.update(current => current.filter(t => t.id !== id));
    }, 4500);
  }

  showSuccess(text: string) {
    this.show(text, 'success');
  }

  showError(text: string) {
    this.show(text, 'error');
  }
}

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed top-5 right-5 left-5 md:left-auto md:w-96 z-[9999] flex flex-col gap-3 pointer-events-none">
      @for (t of toastService.toasts(); track t.id) {
        <div class="p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-3 animate-fade-in pointer-events-auto transition-all"
             [class.bg-emerald-500]="t.type === 'success'" [class.text-white]="t.type === 'success'" [class.border-emerald-600]="t.type === 'success'"
             [class.bg-red-500]="t.type === 'error'" [class.text-white]="t.type === 'error'" [class.border-red-600]="t.type === 'error'"
             [class.bg-royal-teal]="t.type === 'info'" [class.text-white]="t.type === 'info'" [class.border-champagne-gold]="t.type === 'info'">
          
          @if (t.type === 'success') { <span class="material-icons">check_circle</span> }
          @if (t.type === 'error') { <span class="material-icons">error</span> }
          @if (t.type === 'info') { <span class="material-icons font-normal">info</span> }
          
          <div class="flex-grow">{{ t.text }}</div>
          
          <button (click)="remove(t.id)" class="hover:opacity-70 transition-opacity flex items-center justify-center">
            <span class="material-icons text-sm">close</span>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);

  remove(id: number) {
    this.toastService.toasts.update(current => current.filter(t => t.id !== id));
  }
}
