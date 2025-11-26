import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

type ArchiveTab = 'all' | 'pages' | 'banners';
type ArchiveType = 'page' | 'banner';

@Component({
  selector: 'app-archives',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './archive.html',
  styleUrls: ['./archive.scss'],
})
export class ArchivesComponent implements OnInit {

  tab: ArchiveTab = 'all';

  archivedPages: any[] = [];
  archivedBanners: any[] = [];

  isLoading = true;
  error: string | null = null;

  // ⭐ PREVIEW STATE
  previewItem: any | null = null;
  previewType: ArchiveType | null = null;

  private readonly baseUrl = 'https://localhost:7090/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadArchives();
  }

  loadArchives(): void {
    this.isLoading = true;
    this.error = null;

    // Archived Pages
    this.http.get<any[]>(`${this.baseUrl}/ArchivedPages`).subscribe({
      next: (pages) => {
        this.archivedPages = pages;
      },
      error: (err) => {
        console.error('Failed loading archived pages', err);
        this.error = 'Failed to load archived pages.';
      },
    });

    // Archived Banners
    this.http.get<any[]>(`${this.baseUrl}/ArchivedBanners`).subscribe({
      next: (banners) => {
        this.archivedBanners = banners;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed loading archived banners', err);
        this.error = 'Failed to load archived banners.';
        this.isLoading = false;
      },
    });
  }

  setTab(tab: ArchiveTab): void {
    this.tab = tab;
  }

  // ⭐ OPEN PREVIEW MODAL
  openPreview(item: any, type: ArchiveType): void {
    this.previewItem = item;
    this.previewType = type;
  }

  // ⭐ CLOSE PREVIEW MODAL
  closePreview(): void {
    this.previewItem = null;
    this.previewType = null;
  }
}
