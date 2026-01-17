import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { DashboardService } from './services/dashboard.service';
import { ThemeService } from './services/theme.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        HttpClientTestingModule
      ],
      providers: [
        DashboardService,
        ThemeService
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'LearnTrack' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('LearnTrack');
  });

  it('should render dashboard container', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-container')).toBeTruthy();
  });

  it('should initialize with default values', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    
    expect(app.selectedYear).toBe(2024);
    expect(app.selectedDistrict).toBe('All District');
    expect(app.selectedPeriod).toBe('Monthly');
    expect(app.loading).toBe(true);
  });
});
