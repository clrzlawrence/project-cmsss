import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Post {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  status: string; // draft | published
}

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post.html',
  styleUrls: ['./post.scss'],
})
export class PostsComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = []; // ← search display

  searchTerm = '';

  isLoading = true;
  error: string | null = null;

  // modal states
  showNewModal = false;
  showEditModal = false;
  showPreviewModal = false;

  isSaving = false;

  newPost: Post = this.emptyPost();
  editPost: Post = this.emptyPost();
  previewPost: Post | null = null;

  private readonly apiUrl = 'https://localhost:7090/api/Posts';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  private emptyPost(): Post {
    return {
      title: '',
      slug: '',
      description: '',
      content: '',
      status: 'draft',
    };
  }

  // Load Posts from API
  loadPosts(): void {
    this.isLoading = true;

    this.http.get<Post[]>(this.apiUrl).subscribe({
      next: data => {
        this.posts = data;
        this.filteredPosts = data; // ← needed for search
        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Failed to load posts.';
        this.isLoading = false;
      },
    });
  }

  // Search Function
  onSearchChange(): void {
    const t = this.searchTerm.toLowerCase();

    this.filteredPosts = this.posts.filter(p =>
      p.title.toLowerCase().includes(t) ||
      p.slug.toLowerCase().includes(t) ||
      p.description.toLowerCase().includes(t) ||
      p.content.toLowerCase().includes(t)
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
      alert('Title and slug are required.');
      return;
    }

    this.isSaving = true;

    this.http.post<Post>(this.apiUrl, this.newPost).subscribe({
      next: created => {
        this.posts = [created, ...this.posts];
        this.filteredPosts = [...this.posts];
        this.isSaving = false;
        this.showNewModal = false;
      },
      error: err => {
        console.error(err);
        this.isSaving = false;
        alert('Failed to save post.');
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

    this.http
      .put(`${this.apiUrl}/${this.editPost.id}`, this.editPost)
      .subscribe({
        next: () => {
          const i = this.posts.findIndex(p => p.id === this.editPost.id);
          if (i !== -1) this.posts[i] = { ...this.editPost };
          this.filteredPosts = [...this.posts];
          this.isSaving = false;
          this.showEditModal = false;
        },
        error: err => {
          console.error(err);
          this.isSaving = false;
          alert('Failed to update post.');
        },
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
}
