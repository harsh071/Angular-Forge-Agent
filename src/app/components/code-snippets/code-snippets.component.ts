import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileManagementService } from '../../services/file-management.service';
import { UiStateService, CodeSnippet } from '../../services/ui-state.service';
import { DynamicContentComponent } from '../../dynamic-content.component';

@Component({
  selector: 'app-code-snippets',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    DynamicContentComponent
  ],
  template: `
    <div class="code-snippets">
      <mat-card class="snippets-card">
        <mat-card-header>
          <mat-card-title>Code Snippets</mat-card-title>
          <mat-card-subtitle>{{ codeSnippets.length }} snippet(s) available</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-accordion>
            <mat-expansion-panel *ngFor="let snippet of codeSnippets">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>{{ getFileIcon(snippet.filename) }}</mat-icon>
                  &nbsp;{{ snippet.title }}
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="snippet-content">
                <div class="code-header">
                  <button mat-icon-button 
                          (click)="copyText(snippetCode)" 
                          matTooltip="Copy to clipboard">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </div>
                <div #snippetCode>
                  <app-dynamic-content 
                    [dynamicTs]="snippet.content[0].content"
                    [dynamicHtml]="getContent(snippet.content)"
                    [dynamicCss]="snippet.content[2].content">
                  </app-dynamic-content>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .code-snippets {
      padding: 16px;
    }

    .snippets-card {
      width: 100%;
    }

    mat-expansion-panel {
      margin-bottom: 8px;
    }

    .snippet-content {
      margin-top: 16px;
    }

    .code-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 8px;
    }

    mat-panel-title {
      display: flex;
      align-items: center;
    }
  `]
})
export class CodeSnippetsComponent implements OnInit {
  @Input() codeSnippets: CodeSnippet[] = [];

  constructor(
    private fileManagementService: FileManagementService,
    private uiStateService: UiStateService
  ) {}

  ngOnInit(): void {
    this.uiStateService.codeSnippets$.subscribe(
      snippets => this.codeSnippets = snippets
    );
  }

  getFileIcon(filename: string): string {
    return this.fileManagementService.getFileIcon(filename);
  }

  getContent(content: any[]): string {
    // console.log('Content:', content);
    return content[3] ? content[3].content : content[1].content;
  }

  copyText(element: HTMLElement): void {
    const text = element.textContent || '';
    navigator.clipboard.writeText(text);
  }
} 