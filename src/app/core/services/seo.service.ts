import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  lang?: 'ar' | 'en';
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly siteName = 'GACAM';
  private readonly defaultImage = 'https://www.gacam.ca/assets/og-image.jpg';
  private readonly baseUrl = 'https://www.gacam.ca';

  constructor(private meta: Meta, private title: Title, private router: Router) {
    // Auto-update canonical on every navigation
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.updateCanonical(`${this.baseUrl}${e.urlAfterRedirects}`);
      });
  }

  updateMeta(config: SeoConfig): void {
    const fullTitle = `${config.title} | ${this.siteName}`;
    const image = config.image || this.defaultImage;
    const url = config.url || `${this.baseUrl}${this.router.url}`;

    // Title
    this.title.setTitle(fullTitle);

    // Primary
    this.meta.updateTag({ name: 'description', content: config.description });
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });

    // Twitter / X
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    // Language direction
    if (config.lang) {
      document.documentElement.lang = config.lang;
      document.documentElement.dir = config.lang === 'ar' ? 'rtl' : 'ltr';
    }
  }

  private updateCanonical(url: string): void {
    let link: HTMLLinkElement =
      document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }
}
