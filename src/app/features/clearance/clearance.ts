import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { PortfolioApi, Skill } from '../../core/services/portfolio-api';
import { CommonModule } from '@angular/common';

const GROUP_ORDER = ['BACKEND', 'FRONTEND', 'SECURITY / CLOUD', 'AI / ML', 'DATABASES'];

@Component({
  selector: 'app-clearance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clearance.html',
  styleUrl: './clearance.scss',
})
export class Clearance implements OnInit {
  private portfolioApi = inject(PortfolioApi);
  skills = signal<Skill[]>([]);

  showPercent = false;

  groupedSkills = computed(() => {
    const groups = new Map<string, Skill[]>();
    for (const skill of this.skills()) {
      if (!groups.has(skill.category)) {
        groups.set(skill.category, []);
      }
      groups.get(skill.category)!.push(skill);
    }

    const rank = (category: string) => {
      const i = GROUP_ORDER.indexOf(category);
      return i === -1 ? GROUP_ORDER.length : i;
    };

    return Array.from(groups.entries())
      .map(([category, items]) => ({
        category,
        items: [...items].sort((a, b) => b.proficiency - a.proficiency),
      }))
      .sort((a, b) => rank(a.category) - rank(b.category));
  });

  // Splits the boxes into two columns, always adding the next box to the shorter column.
  columns = computed(() => {
    const cols: { category: string; items: Skill[] }[][] = [[], []];
    const heights = [0, 0];
    for (const group of this.groupedSkills()) {
      const target = heights[0] <= heights[1] ? 0 : 1;
      cols[target].push(group);
      heights[target] += group.items.length + 1.5; // rows plus the box heading
    }
    return cols;
  });

  ngOnInit() {
    this.portfolioApi.getSkills().subscribe(data => {
      this.skills.set(data);
    });
  }

  iconUrl(icon: string): string {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${icon}.svg`;
  }

  hideIcon(event: Event): void {
    (event.target as HTMLElement).style.display = 'none';
  }
}