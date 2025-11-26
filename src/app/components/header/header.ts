import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  @Input() showProfile = false;
  showDropdown = false;

  userName = 'Guest';
  userEmail = '';
  userAvatar = 'https://scontent-mnl1-1.xx.fbcdn.net/v/t39.30808-1/224570019_4882169058494561_8380156668375777092_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=110&ccb=1-7&_nc_sid=1d2534&_nc_eui2=AeGig9udzX9Q7bCmIoKqkmzskld63bbbx1KSV3rdttvHUkDMPUxUecj_10BQkNPthUW_vrBVzge2eyP8D3QG6sRm&_nc_ohc=vysagaBbQLYQ7kNvwF5UO9S&_nc_oc=AdkXo6B0Sal7CXdExYYpYgfB6_ca_YfpCHMYPDQVo519LBzEKlzduvvm_5b9W9x4b0c&_nc_zt=24&_nc_ht=scontent-mnl1-1.xx&_nc_gid=Y7BgoqIvH2HiQ3N_601upg&oh=00_AfgfN-ZKs_EHhSK4zv_RB3rD-pBd5HcfxIhIO38ZXcoZLg&oe=691A01C5';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name;
        this.userEmail = user.email;
        this.userAvatar = user.avatar;
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    this.auth.logout();
    this.showDropdown = false;
  }
}