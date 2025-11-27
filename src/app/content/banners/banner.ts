import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// for ?editId=
import { ActivatedRoute } from '@angular/router';

// Angular Editor
import { AngularEditorModule, AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-banners',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AngularEditorModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './banner.html',
  styleUrls: ['./banner.scss'],
})
export class BannersComponent implements OnInit {
  banners: any[] = [];
  isLoading = true;
  error: string | null = null;

  showCreateModal = false;
  isSaving = false;
  isDeleting = false;

  editingBannerId: string | null = null;

  showPreviewModal = false;
  previewBanner: any | null = null;

  newBanner: any = {
    title: '',
    imageUrl: '',
    status: 'draft',
    link: '',
    publishAt: '',
    expireAt: '',
    content: ''
  };

  // highlight support
  private pendingEditId: string | null = null;
  highlightId: string | null = null;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '250px',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    enableToolbar: true,
    showToolbar: true,
    translate: 'no',
    placeholder: 'Write the banner content here...',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    defaultFontSize: '3',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' },
      { class: 'verdana', name: 'Verdana' }
    ],
    toolbarHiddenButtons: [[]]
  };

  publishDate: Date | null = null;
  publishTime = '09:00 AM';

  expireDate: Date | null = null;
  expireTime = '05:00 PM';

  timeOptions: string[] = [];

  private apiUrl = 'https://localhost:7090/api/Banners';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.generateTimes();

    this.route.queryParamMap.subscribe(params => {
      this.pendingEditId = params.get('editId');
    });

    this.loadBanners();
  }

  generateTimes() {
    const options: string[] = [];

    for (let h = 1; h <= 11; h++) {
      const hh = h.toString().padStart(2, '0');
      options.push(`${hh}:00 AM`);
    }

    options.push('12:00 PM');

    for (let h = 1; h <= 11; h++) {
      const hh = h.toString().padStart(2, '0');
      options.push(`${hh}:00 PM`);
    }

    options.push('12:00 AM');

    this.timeOptions = options;
  }

  onEditorFocus(event: any) {
    if (event?.editor && event.editor.undoManager) {
      event.editor.undoManager.clear();
    }
  }

  loadBanners() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        const now = new Date();
        this.banners = data.filter(b => !b.expireAt || new Date(b.expireAt) > now);
        this.isLoading = false;

        // apply highlight if navigated from Latest Activity
        if (this.pendingEditId) {
          const banner = this.banners.find(b => b.id === this.pendingEditId);
          if (banner?.id) {
            this.highlightId = banner.id;
            setTimeout(() => { this.highlightId = null; }, 1200);
          }
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load banners.';
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    this.editingBannerId = null;
    this.newBanner = {
      title: '',
      imageUrl: '',
      status: 'draft',
      link: '',
      publishAt: '',
      expireAt: '',
      content: ''
    };
    this.publishDate = null;
    this.publishTime = '09:00 AM';
    this.expireDate = null;
    this.expireTime = '05:00 PM';
    this.showCreateModal = true;
  }

  openEditModal(banner: any) {
    this.editingBannerId = banner.id;
    this.newBanner = {
      title: banner.title,
      imageUrl: banner.imageUrl,
      status: banner.status,
      link: banner.link,
      publishAt: banner.publishAt,
      expireAt: banner.expireAt,
      content: banner.content || ''
    };

    if (banner.publishAt) {
      const d = new Date(banner.publishAt);
      this.publishDate = d;
      this.publishTime = this.formatTime12h(d);
    } else {
      this.publishDate = null;
      this.publishTime = '09:00 AM';
    }

    if (banner.expireAt) {
      const d = new Date(banner.expireAt);
      this.expireDate = d;
      this.expireTime = this.formatTime12h(d);
    } else {
      this.expireDate = null;
      this.expireTime = '05:00 PM';
    }

    this.showCreateModal = true;
  }

  closeCreateModal() {
    if (this.isSaving || this.isDeleting) return;
    this.showCreateModal = false;
    this.editingBannerId = null;
  }

  saveBanner() {
    const publishIso = this.combineDateTime(this.publishDate, this.publishTime);
    const expireIso = this.combineDateTime(this.expireDate, this.expireTime);

    if (!this.newBanner.title || !this.newBanner.imageUrl || !publishIso || !expireIso) {
      alert('Please fill in all required fields.');
      return;
    }

    this.newBanner.publishAt = publishIso;
    this.newBanner.expireAt = expireIso;
    this.isSaving = true;

    if (this.editingBannerId) {
      this.http.put(`${this.apiUrl}/${this.editingBannerId}`, this.newBanner).subscribe({
        next: () => {
          this.isSaving = false;
          this.showCreateModal = false;
          this.editingBannerId = null;
          this.loadBanners();
        },
        error: () => {
          this.isSaving = false;
          alert('Failed to update banner.');
        }
      });
      return;
    }

    this.http.post<any>(this.apiUrl, this.newBanner).subscribe({
      next: (created) => {
        this.banners.unshift(created);
        this.isSaving = false;
        this.showCreateModal = false;
      },
      error: () => {
        this.isSaving = false;
        alert('Failed to save banner.');
      }
    });
  }

  deleteBanner() {
    if (!this.editingBannerId) return;
    if (!confirm('Delete this banner?')) return;

    this.isDeleting = true;

    this.http.delete(`${this.apiUrl}/${this.editingBannerId}`).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showCreateModal = false;
        this.editingBannerId = null;
        this.loadBanners();
      },
      error: () => {
        this.isDeleting = false;
        alert('Failed to delete banner.');
      }
    });
  }

  openPreviewModal(banner: any) {
    this.previewBanner = banner;
    this.showPreviewModal = true;
  }

  closePreviewModal() {
    this.showPreviewModal = false;
    this.previewBanner = null;
  }

  stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  getStatusClass(status: string | undefined): string {
    return (status || '').toLowerCase() === 'published' ? 'published' : 'draft';
  }

  private formatTime12h(date: Date): string {
    let h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  private combineDateTime(date: Date | null, time: string): string | null {
    if (!date || !time) return null;

    const [timePart, ampm] = time.split(' ');
    const [hh, mm] = timePart.split(':').map(v => parseInt(v, 10));

    let hours = hh;
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const result = new Date(date);
    result.setHours(hours, mm, 0, 0);
    return result.toISOString();
  }
}
