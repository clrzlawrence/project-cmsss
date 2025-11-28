import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AngularEditorModule, AngularEditorConfig } from '@kolkov/angular-editor';

interface Post {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  status: string;

  // ⭐ ADDITIONAL FIELDS FOR DATES
  createdAt?: string;
  publishedAt?: string | null;
}

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, AngularEditorModule],
  templateUrl: './post.html',
  styleUrls: ['./post.scss'],
})
export class PostsComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];

  searchTerm = '';

  isLoading = true;
  error: string | null = null;

  showNewModal = false;
  showEditModal = false;
  showPreviewModal = false;

  isSaving = false;

  newPost: Post = this.emptyPost();
  editPost: Post = this.emptyPost();
  previewPost: Post | null = null;

  private pendingEditId: string | null = null;
  highlightId: string | null = null;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '250px',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Write the post content here...',
    defaultParagraphSeparator: 'p',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' },
      { class: 'verdana', name: 'Verdana' },
    ],
  };

  private readonly apiUrl = 'https://localhost:7090/api/Posts';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.pendingEditId = params.get('editId');
    });

    this.loadPosts();
  }

  private emptyPost(): Post {
    return {
      title: '',
      slug: '',
      description: '',
      content: '',
      status: 'draft',
      createdAt: undefined,
      publishedAt: null,
    };
  }

  // LOAD
  loadPosts(): void {
    this.isLoading = true;

    this.http.get<Post[]>(this.apiUrl).subscribe({
      next: data => {
        this.posts = data;
        this.filteredPosts = data;
        this.isLoading = false;

        // ⭐ highlight card kung gikan sa Latest Activity
        if (this.pendingEditId) {
          const post = this.posts.find(x => x.id === this.pendingEditId);
          if (post?.id) {
            this.highlightId = post.id;
            setTimeout(() => (this.highlightId = null), 1200);
          }
        }
      },
      error: err => {
        console.error(err);
        this.error = 'Failed to load posts.';
        this.isLoading = false;
      },
    });
  }

  // SEARCH
  onSearchChange(): void {
    const t = this.searchTerm.toLowerCase();
    this.filteredPosts = this.posts.filter(
      p =>
        (p.title || '').toLowerCase().includes(t) ||
        (p.slug || '').toLowerCase().includes(t) ||
        (p.description || '').toLowerCase().includes(t) ||
        this.stripHtml(p.content || '').toLowerCase().includes(t)
    );
  }

  // ========== NEW POST ==========
  openNewModal(): void {
    this.newPost = this.emptyPost();
    this.showNewModal = true;
  }

  closeNewModal(): void {
    this.showNewModal = false;
  }

  saveNewPost(): void {
    if (!this.newPost.title || !this.newPost.slug) {
      return;
    }

    this.isSaving = true;

    // ⭐ set createdAt always; set publishedAt kung published na
    const nowIso = new Date().toISOString();

    const payload: Post = {
      ...this.newPost,
      createdAt: nowIso,
      publishedAt:
        this.newPost.status === 'published' ? nowIso : null,
    };

    this.http.post<Post>(this.apiUrl, payload).subscribe({
      next: created => {
        this.posts.unshift(created);
        this.filteredPosts = [...this.posts];
        this.isSaving = false;
        this.showNewModal = false;
      },
      error: err => {
        console.error(err);
        this.isSaving = false;
      },
    });
  }

  // ========== EDIT ==========
  openEditModal(post: Post): void {
    this.editPost = { ...post };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveEditPost(): void {
    if (!this.editPost.id) return;

    this.isSaving = true;

    // ⭐ kung gi-publish karon ug wala pay publishedAt → set now
    let publishedAt = this.editPost.publishedAt ?? null;
    if (this.editPost.status === 'published' && !publishedAt) {
      publishedAt = new Date().toISOString();
    }

    const payload: Post = {
      ...this.editPost,
      publishedAt,
    };

    this.http.put(`${this.apiUrl}/${this.editPost.id}`, payload).subscribe({
      next: () => {
        const idx = this.posts.findIndex(p => p.id === this.editPost.id);
        if (idx !== -1) this.posts[idx] = { ...payload };
        this.filteredPosts = [...this.posts];
        this.isSaving = false;
        this.showEditModal = false;
      },
      error: err => {
        console.error(err);
        this.isSaving = false;
      },
    });
  }

  // ========== DELETE ==========
  deletePost(): void {
    if (!this.editPost.id) return;
    if (!confirm(`Delete post "${this.editPost.title}"?`)) return;

    this.http.delete(`${this.apiUrl}/${this.editPost.id}`).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== this.editPost.id);
        this.filteredPosts = [...this.posts];
        this.showEditModal = false;
      },
      error: err => console.error(err),
    });
  }

  // ========== PREVIEW ==========
  openPreview(post: Post): void {
    this.previewPost = post;
    this.showPreviewModal = true;
  }

  closePreview(): void {
    this.previewPost = null;
    this.showPreviewModal = false;
  }

  // UTIL
  stripHtml(html: string): string {
    const d = document.createElement('div');
    d.innerHTML = html || '';
    return d.textContent || '';
  }
}
