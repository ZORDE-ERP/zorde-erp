import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToaster } from 'src/app/shared/ui/sonner';

@Component({
  selector: 'zorde-root',
  standalone: true,
  imports: [RouterOutlet, HlmToaster],
  templateUrl: './app.html',
})
export class App {}
