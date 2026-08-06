// import { Component } from '@angular/core';
import { Component, inject, signal, OnInit } from '@angular/core';
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

export class CaseFiles implements OnInit {
  // private portfolioApi = inject(PortfolioApi);
  // projects = signal<Project[]>([]);

  // ngOnInit() {
  //   this.portfolioApi.getProjects().subscribe(projects => {
  //     this.projects.set(projects);
  //   });
  // }

  private portfolioApi = inject(PortfolioApi);
  projects = signal<Project[]>([]);
  expandedId = signal<number | null>(null);

  ngOnInit() {
    this.portfolioApi.getProjects().subscribe(projects => {
      this.projects.set(projects);
    });
  }

  toggle(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  techList(techStack: string): string[] {
    return techStack
      ? techStack.split(',').map(t => t.trim()).filter(Boolean)
      : [];
  }
}
