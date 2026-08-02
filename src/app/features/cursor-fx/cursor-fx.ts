import { Component, ElementRef, HostListener, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-cursor-fx',
  standalone: true,
  imports: [],
  templateUrl: './cursor-fx.html',
  styleUrl: './cursor-fx.scss'
})
export class CursorFx implements AfterViewInit {
  @ViewChild('reticle') reticleRef!: ElementRef<HTMLDivElement>;

  private targetX = 0;
  private targetY = 0;
  private currentX = 0;
  private currentY = 0;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.targetX = e.clientX;
    this.targetY = e.clientY;
  }

  ngAfterViewInit() {
    this.animate();
  }

  private animate = () => {
    this.currentX += (this.targetX - this.currentX) * 0.15;
    this.currentY += (this.targetY - this.currentY) * 0.15;

    const el = this.reticleRef.nativeElement;
    el.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;

    requestAnimationFrame(this.animate);
  };
}