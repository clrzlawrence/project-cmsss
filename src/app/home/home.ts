import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Widget } from './widgets/widget.model';
import { WidgetComponent } from './widgets/widgets';
import { Router } from '@angular/router';

interface ActivityLogEntry {
  timestamp: string;
  userName: string;
  action: string;
  contentType: string;
  contentTitle: string;
  contentId: string;
  status: string;
}

interface ArchivesCountResponse {
  total: number;
  banners: number;
  pages: number;
}

// UI item (para ma-store nato ang contentType + contentId)
interface UiActivityItem {
  text: string;
  user: string;
  time: string;
  icon: string;
  contentType: string;
  contentId: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, WidgetComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {
  // ───────────── DASHBOARD CARDS ─────────────
  cards: Widget[] = [
    {
      id: 1,
      title: 'Pages',
      number: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>`
    },
    {
      id: 2,
      title: 'Posts',
      number: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>`
    },
    {
      id: 3,
      title: 'Banners',
      number: 0,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"> <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>'
    },
    {
      id: 4,
      title: 'Archives',
      number: 0,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>'
    }
  ];

  // ───────────── LATEST ACTIVITY (from API) ─────────────
  latestActivity: UiActivityItem[] = [];

  private activityApiUrl = 'https://localhost:7090/api/ActivityLogs';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadCounts();
    this.loadLatestActivity();
  }

  // ───────────── LOAD COUNTS FOR CARDS ─────────────
  loadCounts(): void {
    // Pages
    this.http.get<number>('https://localhost:7090/api/Pages/count').subscribe({
      next: (n) => (this.cards[0].number = n),
      error: (err) => console.error('Failed to load pages count', err),
    });

    // Posts
    this.http.get<number>('https://localhost:7090/api/Posts/count').subscribe({
      next: (n) => (this.cards[1].number = n),
      error: (err) => console.error('Failed to load posts count', err),
    });

    // Banners
    this.http.get<number>('https://localhost:7090/api/Banners/count').subscribe({
      next: (n) => (this.cards[2].number = n),
      error: (err) => console.error('Failed to load banners count', err),
    });

    // Archives
    this.http
      .get<ArchivesCountResponse>('https://localhost:7090/api/Archives/count')
      .subscribe({
        next: (res) => {
          this.cards[3].number = res.total;
        },
        error: (err) => console.error('Failed to load archives count', err),
      });
  }

  // optional
  goToArchives(): void {
    this.router.navigate(['/content/archives']);
  }

  // ───────────── LOAD LATEST ACTIVITY ─────────────
  loadLatestActivity(): void {
    this.http.get<ActivityLogEntry[]>(`${this.activityApiUrl}?take=10`).subscribe({
      next: (logs) => {
        this.latestActivity = logs.map((entry) => ({
          text: `[${this.getContentTypeLabel(entry.contentType)}] ${entry.action} ${
            entry.contentTitle ? '"' + entry.contentTitle + '"' : ''
          }`.trim(),
          user: entry.userName,
          time: this.formatTimeAgo(entry.timestamp),
          icon: this.getIcon(entry.action),
          contentType: entry.contentType,
          contentId: entry.contentId,
        }));
      },
      error: (err) => {
        console.error('Failed to load latest activity', err);
      },
    });
  }

  private getContentTypeLabel(type: string): string {
    const t = (type || '').toLowerCase();
    if (t === 'page') return 'Page';
    if (t === 'post') return 'Post';
    if (t === 'banner') return 'Banner';
    return 'Other';
  }

  // "1h ago", "3d ago", etc.
  formatTimeAgo(timestamp: string): string {
    const time = new Date(timestamp);
    if (isNaN(time.getTime())) {
      return '';
    }

    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  // Choose icon based on action text
  getIcon(action: string): string {
    const text = (action || '').toLowerCase();
    if (text.includes('create')) return 'assets/icons/add.svg';
    if (text.includes('update')) return 'assets/icons/edit.svg';
    if (text.includes('delete')) return 'assets/icons/delete.svg';
    if (text.includes('publish')) return 'assets/icons/ok.svg';
    return 'assets/icons/info.svg';
  }

  // ⭐ CLICK HANDLER: jump to correct page/post/banner
  goToItem(item: UiActivityItem): void {
    if (!item.contentType || !item.contentId) {
      return;
    }

    const type = item.contentType.toLowerCase();
    const id = item.contentId;

    if (type === 'page') {
      this.router.navigate(['/content/pages'], { queryParams: { editId: id } });
    } else if (type === 'post') {
      this.router.navigate(['/content/posts'], { queryParams: { editId: id } });
    } else if (type === 'banner') {
      this.router.navigate(['/content/banners'], { queryParams: { editId: id } });
    }
  }
}
