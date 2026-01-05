import {NavbarComponent} from './components/navbar/navbar';
import {RouterOutlet} from "@angular/router";
import {signal} from "@angular/core";

// @ts-ignore
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App {
  protected readonly title = signal('frontend');
}
