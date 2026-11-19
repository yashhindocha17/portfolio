// // import { Component } from '@angular/core';
// import { Component, inject, signal, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { PortfolioApi, Project } from '../../core/services/portfolio-api';
// import { SectionHead } from '../../shared/section-head/section-head';

// @Component({
//   selector: 'app-case-files',
//   standalone: true,
//   imports: [CommonModule, SectionHead],
//   templateUrl: './case-files.html',
//   styleUrl: './case-files.scss',
// })

// export class CaseFiles implements OnInit {
//   // private portfolioApi = inject(PortfolioApi);
//   // projects = signal<Project[]>([]);

//   // ngOnInit() {
//   //   this.portfolioApi.getProjects().subscribe(projects => {
//   //     this.projects.set(projects);
//   //   });
//   // }

//   private portfolioApi = inject(PortfolioApi);
//   projects = signal<Project[]>([]);
//   expandedId = signal<number | null>(null);

//   ngOnInit() {
//     this.portfolioApi.getProjects().subscribe(projects => {
//       this.projects.set(projects);
//     });
//   }

//   toggle(id: number): void {
//     this.expandedId.set(this.expandedId() === id ? null : id);
//   }

//   techList(techStack: string): string[] {
//     return techStack
//       ? techStack.split(',').map(t => t.trim()).filter(Boolean)
//       : [];
//   }
// }


import { Component, inject, signal, computed, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioApi, Project } from '../../core/services/portfolio-api';
import { SectionHead } from '../../shared/section-head/section-head';

@Component({
  selector: 'app-case-files',
  standalone: true,
  imports: [CommonModule, SectionHead],
  templateUrl: './case-files.html',
  styleUrl: './case-files.scss',
})
export class CaseFiles implements OnInit, OnDestroy {
  private portfolioApi = inject(PortfolioApi);

  projects = signal<Project[]>([]);
  selected = signal<Project | null>(null);
  showAll = signal(false);

  readonly featuredCount = 3;

  // The API already sorts by SortOrder, so the first three are the featured ones.
  visible = computed(() =>
    this.showAll() ? this.projects() : this.projects().slice(0, this.featuredCount)
  );
  hiddenCount = computed(() => Math.max(0, this.projects().length - this.featuredCount));

  // Change the wording shown on the badge here. The database values stay as they are.
  private statusLabels: Record<string, string> = {
    deployed: 'deployed',
    research: 'research',
  };

  ngOnInit() {
    this.portfolioApi.getProjects().subscribe(projects => {
      this.projects.set(projects);
    });
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  open(project: Project): void {
    this.selected.set(project);
    document.body.style.overflow = 'hidden';
  }

  @HostListener('document:keydown.escape')
  close(): void {
    if (this.selected()) {
      this.selected.set(null);
      document.body.style.overflow = '';
    }
  }

  toggleAll(): void {
    this.showAll.set(!this.showAll());
  }

  statusLabel(status: string): string {
    return this.statusLabels[(status ?? '').toLowerCase()] ?? status;
  }

  statusClass(status: string): string {
    const key = (status ?? '').toLowerCase();
    return key === 'deployed' || key === 'research' ? key : 'other';
  }

  techList(techStack: string): string[] {
    return techStack ? techStack.split(',').map(t => t.trim()).filter(Boolean) : [];
  }

  paragraphs(text: string): string[] {
    return (text ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  }
}