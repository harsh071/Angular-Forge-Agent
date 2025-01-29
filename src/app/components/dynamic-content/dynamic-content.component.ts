import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-dynamic-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dynamic-content">
      <style>{{ dynamicCss }}</style>
      <div [innerHTML]="sanitizedHtml"></div>
    </div>
  `,
  styles: [`
    .dynamic-content {
      width: 100%;
      overflow-x: auto;
    }
  `]
})
export class DynamicContentComponent implements OnChanges {
  @Input() dynamicHtml = '';
  @Input() dynamicCss = '';
  @Input() dynamicTs = '';

  sanitizedHtml: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dynamicHtml']) {
      this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(this.dynamicHtml);
    }
  }
} 