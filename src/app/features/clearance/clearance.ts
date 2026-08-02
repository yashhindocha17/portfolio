import { Component, computed, inject, signal } from '@angular/core';
import { PortfolioApi, Skill } from '../../core/services/portfolio-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clearance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clearance.html',
  styleUrl: './clearance.scss',
})
export class Clearance {
   private portfolioApi = inject(PortfolioApi);
  skills = signal<Skill[]>([]);

  groupedSkills = computed(() => {
    const groups = new Map<string, Skill[]>();
    for (const skill of this.skills()) {
      if (!groups.has(skill.category)) {
        groups.set(skill.category, []);
      }
      groups.get(skill.category)!.push(skill);
    }
    return Array.from(groups.entries()).map(([category, items]) => ({ category, items }));
  });

  ngOnInit() {
    this.portfolioApi.getSkills().subscribe(data => {
      this.skills.set(data);
    });
  }
}
