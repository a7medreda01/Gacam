import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { NewsArticle } from '../../models/types';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule, NavbarComponent, FooterComponent, TranslatePipe],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  langService = inject(LanguageService);
  apiService = inject(GacamApiService);

  newsList = signal<NewsArticle[]>([]);

  ngOnInit() {
    this.fetchLatestNews();
  }

  fetchLatestNews() {
    this.apiService.getNews().subscribe({
      next: (data) => {
        const items = data?.items || data;
        if (Array.isArray(items)) {
          this.newsList.set(items.slice(0, 4));
        }
      },
      error: () => {}
    });
  }
}