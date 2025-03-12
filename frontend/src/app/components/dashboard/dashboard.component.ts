import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any;
  cards: any = [];

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');

    if (!this.user?.user_id) {
      this.router.navigate(['/']);
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/dashboard-data?userId=${this.user.user_id}`)
      .subscribe({
        next: (data) => {
          console.log("✅ Dashboard Data from API:", data);
          this.cards = data;
        },
        error: (error) => {
          console.error("❌ Error fetching dashboard:", error);
        }
      });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}