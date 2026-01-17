import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryCardsComponent } from './summary-cards.component';

describe('SummaryCardsComponent', () => {
  let component: SummaryCardsComponent;
  let fixture: ComponentFixture<SummaryCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryCardsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SummaryCardsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format numbers correctly', () => {
    expect(component.formatNumber(1500)).toBe('1.5k');
    expect(component.formatNumber(500)).toBe('500');
    expect(component.formatNumber(10000)).toBe('10.0k');
  });

  it('should handle null summary gracefully', () => {
    component.summary = null;
    expect(component).toBeTruthy();
  });
});
