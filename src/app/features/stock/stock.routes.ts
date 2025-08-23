import { Routes } from '@angular/router';

export const stockRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./stock.component').then(m => m.StockComponent)
  },
  {
    path: 'articles',
    loadComponent: () => import('./articles.component').then(m => m.ArticlesComponent)
  },
  {
    path: 'articles/nouveau',
    loadComponent: () => import('./article-form.component').then(m => m.ArticleFormComponent)
  },
  {
    path: 'articles/:id',
    loadComponent: () => import('./article-form.component').then(m => m.ArticleFormComponent)
  }
];
