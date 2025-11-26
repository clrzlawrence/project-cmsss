import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type ActivityStatus = 'Success' | 'Complete' | 'Failed' | string;
type ContentFilter = 'all' | 'page' | 'post' | 'banner' | 'popup' | 'system';

interface ActivityLogEntry {
  timestamp: string;
  userName: string;
  action: string;
  contentType: string;
  contentTitle: string;
  contentId: string;
  status: ActivityStatus;
}

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-log.html',
  styleUrls: ['./activity-log.scss'],
})
export class ActivityLogComponent implements OnInit {
  contentFilter: ContentFilter = 'all';

  filterOptions: { value: ContentFilter; label: string }[] = [
    { value: 'all', label: 'All contents' },
    { value: 'page', label: 'Pages' },
    { value: 'post', label: 'Posts' },
    { value: 'banner', label: 'Banners' },
    { value: 'popup', label: 'Popups' },
    { value: 'system', label: 'System' },
  ];

  activityLog: ActivityLogEntry[] = [];   // ⭐ now from API
  isLoading = false;
  error: string | null = null;

  private apiUrl = 'https://localhost:7090/api/ActivityLogs';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadActivityLog();
  }

  // ⭐ NEW: load from API
  loadActivityLog() {
    this.isLoading = true;
    this.error = null;

    this.http
      .get<ActivityLogEntry[]>(`${this.apiUrl}?take=200`)
      .subscribe({
        next: (data) => {
          this.activityLog = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load activity log.';
          this.isLoading = false;
        },
      });
  }

  get filteredLog(): ActivityLogEntry[] {
    if (this.contentFilter === 'all') {
      return this.activityLog;
    }
    return this.activityLog.filter(
      (entry) => entry.contentType === this.contentFilter
    );
  }

  formatTimestamp(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;

    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  getStatusClass(status: ActivityStatus): string {
    const s = (status || '').toLowerCase();
    if (s === 'success') return 'status-pill success';
    if (s === 'complete') return 'status-pill complete';
    if (s === 'failed' || s === 'error') return 'status-pill failed';
    return 'status-pill';
  }
}
