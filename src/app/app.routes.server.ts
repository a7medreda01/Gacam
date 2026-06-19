import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'page/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'verify-certificate/:number',
    renderMode: RenderMode.Server,
  },
  {
    path: 'orders/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
