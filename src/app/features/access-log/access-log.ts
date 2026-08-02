import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioApi, ExperienceEntry } from '../../core/services/portfolio-api';
import { SectionHead } from '../../shared/section-head/section-head';

@Component({
  selector: 'app-access-log',
  standalone: true,
  imports: [CommonModule, SectionHead],
  templateUrl: './access-log.html',
  styleUrl: './access-log.scss'
})
export class AccessLog implements OnInit {
  private portfolioApi = inject(PortfolioApi);
  entries = signal<ExperienceEntry[]>([]);

  ngOnInit() {
    this.portfolioApi.getExperience().subscribe(data => {
      this.entries.set(data);
    });
  }
}