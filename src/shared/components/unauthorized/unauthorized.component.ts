import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css'],
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
