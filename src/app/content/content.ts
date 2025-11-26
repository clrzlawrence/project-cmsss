import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './content.html',
  styleUrls: ['./content.scss'],
})
export class Content {}
