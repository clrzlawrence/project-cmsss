import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

export interface Page {
  id?: string;
  title: string;
  slug: string;
  description?: string;
  status: 'draft' | 'published';
  content?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private readonly baseUrl = `${environment.apiUrl}/Pages`;

  constructor(private http: HttpClient) {}

  getPages(): Observable<Page[]> {
    return this.http.get<Page[]>(this.baseUrl);
  }
}
