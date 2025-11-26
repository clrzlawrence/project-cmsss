import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface Page {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  status: string;      // draft | published

  featuredImage?: string;
  tags?: string;       // comma separated in UI
  category?: string;   // Home, About Us, etc.
  publishDate?: string;
  author?: string;
}

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pages.html',
  styleUrls: ['./pages.scss'],
})
export class PagesComponent implements OnInit {
  pages: Page[] = [];
  filteredPages: Page[] = [];

  searchTerm = '';

  isLoading = true;
  error: string | null = null;

  showNewModal = false;
  showEditModal = false;
  showPreviewModal = false;

  isSaving = false;

  newPage: Page = this.emptyPage();
  editPageObj: Page = this.emptyPage();
  previewPage: Page | null = null;

  private readonly apiUrl = 'https://localhost:7090/api/Pages';

  // MAIN PAGE / SECTION OPTIONS
  mainPageOptions: string[] = [
    'Home',
    'Stock',
    'Services',
    'About Us',
    'Contact',
    'News'
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPages();
  }

  private emptyPage(): Page {
    return {
      title: '',
      slug: '',
      description: '',
      content: '',
      status: 'draft',
      featuredImage: '',
      tags: '',
      category: '',
      publishDate: '',
      author: '',
    };
  }

  // LOAD
  loadPages(): void {
    this.isLoading = true;
    this.error = null;

    this.http.get<Page[]>(this.apiUrl).subscribe({
      next: data => {
        this.pages = data;
        this.filteredPages = data;
        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Failed to load pages.';
        this.isLoading = false;
      },
    });
  }

  // SEARCH
  onSearchChange(): void {
    const t = this.searchTerm.toLowerCase();

    this.filteredPages = this.pages.filter(p =>
      (p.title || '').toLowerCase().includes(t) ||
      (p.slug || '').toLowerCase().includes(t) ||
      (p.description || '').toLowerCase().includes(t) ||
      (p.content || '').toLowerCase().includes(t) ||
      (p.category || '').toLowerCase().includes(t)
    );
  }

  // NEW PAGE
  openNewModal(): void {
    this.newPage = this.emptyPage();
    this.showNewModal = true;
  }

  closeNewModal(): void {
    this.showNewModal = false;
  }

  saveNewPage(): void {
    if (!this.newPage.title || !this.newPage.slug) {
      alert('Title and slug are required.');
      return;
    }

    this.isSaving = true;

    const payload: any = {
      ...this.newPage,
      tags: this.newPage.tags
        ? this.newPage.tags.split(',').map(t => t.trim()).filter(t => !!t)
        : [],
    };

    this.http.post<Page>(this.apiUrl, payload).subscribe({
      next: created => {
        this.pages = [created, ...this.pages];
        this.filteredPages = [...this.pages];
        this.isSaving = false;
        this.showNewModal = false;
      },
      error: err => {
        console.error(err);
        this.isSaving = false;
        alert('Failed to save page.');
      },
    });
  }

  // EDIT
  openEditModal(page: Page): void {
    const anyPage: any = page;

    this.editPageObj = {
      ...page,
      tags: Array.isArray(anyPage.tags)
        ? anyPage.tags.join(', ')
        : (page.tags || ''),
    };

    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveEditPage(): void {
    if (!this.editPageObj.id) return;

    this.isSaving = true;

    const payload: any = {
      ...this.editPageObj,
      tags: this.editPageObj.tags
        ? this.editPageObj.tags.split(',').map(t => t.trim()).filter(t => !!t)
        : [],
    };

    this.http
      .put(`${this.apiUrl}/${this.editPageObj.id}`, payload)
      .subscribe({
        next: () => {
          const i = this.pages.findIndex(p => p.id === this.editPageObj.id);
          if (i !== -1) this.pages[i] = { ...this.editPageObj };
          this.filteredPages = [...this.pages];
          this.isSaving = false;
          this.showEditModal = false;
        },
        error: err => {
          console.error(err);
          this.isSaving = false;
          alert('Failed to update page.');
        },
      });
  }

  // PREVIEW
  openPreview(page: Page): void {
    this.previewPage = page;
    this.showPreviewModal = true;
  }

  closePreview(): void {
    this.previewPage = null;
    this.showPreviewModal = false;
  }

  // ⭐ NEW: DELETE CURRENT EDITED PAGE
  deletePage(): void {
    if (!this.editPageObj.id) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete page "${this.editPageObj.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.isSaving = true;

    this.http.delete(`${this.apiUrl}/${this.editPageObj.id}`).subscribe({
      next: () => {
        // remove from arrays
        this.pages = this.pages.filter(p => p.id !== this.editPageObj.id);
        this.filteredPages = this.filteredPages.filter(
          p => p.id !== this.editPageObj.id
        );

        this.isSaving = false;
        this.showEditModal = false;
      },
      error: err => {
        console.error(err);
        this.isSaving = false;
        alert('Failed to delete page.');
      },
    });
  }
}
