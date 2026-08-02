import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-head',
  imports: [],
  templateUrl: './section-head.html',
  styleUrl: './section-head.scss',
})
export class SectionHead {
  tag = input.required<string>();
  title = input.required<string>();
}
