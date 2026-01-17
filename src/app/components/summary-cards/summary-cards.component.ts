import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Summary } from '../../models/dashboard-response.model';

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-cards.component.html',
  styleUrls: ['./summary-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryCardsComponent {
  @Input() summary: Summary | null = null;

  formatNumber(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toLocaleString();
  }
}
