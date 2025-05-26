import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-cube',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-cube.component.html',
  styleUrl: './loading-cube.component.css'
})
export class LoadingCubeComponent {
  letters = ['L', 'O', 'A', 'D', 'I', 'N', 'G'];
}
