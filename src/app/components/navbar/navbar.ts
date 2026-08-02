import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar">
      <div class="navbar__logo">YN</div>
      <nav class="navbar__pill">
        <a *ngFor="let link of links" [href]="link.href">{{ link.label }}</a>
      </nav>
      <a href="#contact" class="navbar__cta">Let's talk</a>
    </header>
  `,
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  // links = [
  //   { label: 'Home', href: '#home' },
  //   { label: 'About', href: '#about' },
  //   { label: 'Skills', href: '#skills' },
  //   { label: 'Projects', href: '#projects' },
  //   { label: 'Contact', href: '#contact' }
  // ];
  links = [
  { label: 'Home', href: '#hero-section' },
  { label: 'About', href: '#access-log-section' },
  { label: 'Skills', href: '#clearance-section' },
  { label: 'Projects', href: '#cases-section' },
  { label: 'Contact', href: '#contact' }
];
}