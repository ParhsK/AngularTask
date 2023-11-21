import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-my-chip',
  templateUrl: './my-chip.component.html',
  styleUrls: ['./my-chip.component.css']
})
export class MyChipComponent {
  @Input() color = '';
}
