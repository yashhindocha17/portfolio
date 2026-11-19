import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioApi, Experience } from '../../core/services/portfolio-api';
import { SectionHead } from '../../shared/section-head/section-head';

type ViewEntry = Experience & { bullets: string[]; tags: string[] };

const GROUPS = [
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'certification', label: 'Certifications' },
];


@Component({
  selector: 'app-access-log',
  standalone: true,
  imports: [CommonModule, SectionHead],
  templateUrl: './access-log.html',
  styleUrl: './access-log.scss'
})

export class AccessLog implements OnInit {
  private portfolioApi = inject(PortfolioApi);
  entries = signal<Experience[]>([]);

  // Groups entries by category. The API already sorts newest first, so order is kept.
  groups = computed(() => {
    const view: ViewEntry[] = this.entries().map(e => ({
      ...e,
      bullets: this.split(e.details, /\r?\n/),
      tags: this.split(e.techStack, /,/),
    }));
    return GROUPS
      .map(g => ({ ...g, items: view.filter(e => this.keyOf(e) === g.key) }))
      .filter(g => g.items.length > 0);
  });

  ngOnInit() {
    this.portfolioApi.getExperience().subscribe(data => {
      this.entries.set(data);
    });
  }

  // Any unknown or missing category is shown under Experience, so a new row never disappears.
  private keyOf(e: Experience): string {
    const c = (e.category ?? '').toLowerCase();
    return c === 'education' || c === 'certification' ? c : 'experience';
  }

  private split(text: string | null | undefined, sep: RegExp): string[] {
    return (text ?? '').split(sep).map(s => s.trim()).filter(s => s.length > 0);
  }
}