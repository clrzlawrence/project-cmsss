import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';   // ⭐ NEW

export interface Widget {
  id: number;
  title: string;
  number: number;
  icon: string;
}

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './widgets.html',
  styleUrls: ['./widgets.scss']
})
export class WidgetComponent {
  @Input() data!: Widget; // <-- needed for [data] binding

  constructor(private router: Router) {}   // ⭐ NEW

  // ⭐ NEW: handle View button clicks
  onViewClick(): void {
    // Only Archives card should navigate for now
    if (this.data.title === 'Archives' || this.data.id === 4) {
      this.router.navigate(['/content/archives']);
    }

    // Optional: later pwede nimo buhaton:
    // if (this.data.title === 'Pages') this.router.navigate(['/content/pages']);
    // if (this.data.title === 'Posts') this.router.navigate(['/content/posts']);
    // if (this.data.title === 'Banners') this.router.navigate(['/content/banners']);
  }
}
