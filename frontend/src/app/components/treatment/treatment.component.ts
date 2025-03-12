import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-treatment',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './treatment.component.html',
  styleUrls: ['./treatment.component.css']
})
export class TreatmentComponent {
  status = 'Pending';

  startTreatment() {
    this.status = 'In Progress';
    setTimeout(() => {
      this.status = 'Completed';
    }, 5000);
  }
}