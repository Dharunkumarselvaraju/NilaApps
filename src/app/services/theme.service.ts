import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeKey = 'dashboard-theme';
  private themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());
  
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(this.themeKey) as Theme;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return 'light';
  }

  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    localStorage.setItem(this.themeKey, theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.body.className = theme;
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}
