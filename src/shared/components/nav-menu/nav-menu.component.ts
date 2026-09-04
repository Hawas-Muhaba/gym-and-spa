import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule],
  templateUrl: './nav-menu.component.html',
})
export class NavMenuComponent {
  authStore = inject(AuthStore);

  isManager = computed(() => this.authStore.user()?.role === 'Manager');
  isStaffOrManager = computed(() => {
    const role = this.authStore.user()?.role;
    return role === 'Staff' || role === 'Manager';
  });

  logout() {
    this.authStore.logout();
  }
}