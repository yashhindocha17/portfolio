import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Hero } from './features/hero/hero';
import { CursorFx } from './features/cursor-fx/cursor-fx';
import { CaseFiles } from './features/case-files/case-files';
import { AccessLog } from './features/access-log/access-log';
import { Clearance } from './features/clearance/clearance';
import { SectionHead } from './shared/section-head/section-head';
import { FluidBg } from './shared/fluid-bg/fluid-bg';
import { NavbarComponent } from './components/navbar/navbar';
import { ContactComponent } from './features/contact/contact';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, 
            Hero, 
            CursorFx,
            CaseFiles, 
            AccessLog, 
            Clearance, 
            SectionHead, 
            FluidBg,
            NavbarComponent,
            ContactComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('frontend');
}
