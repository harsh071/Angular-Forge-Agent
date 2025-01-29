import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CodeGenerationService, GeneratedFile } from '../../services/code-generation.service';
import { FileManagementService } from '../../services/file-management.service';
import { UiStateService } from '../../services/ui-state.service';
import { DynamicContentComponent } from '../dynamic-content/dynamic-content.component';

@Component({
  selector: 'app-code-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    DynamicContentComponent
  ],
  template: `
    <div class="results" *ngIf="description || generatedFiles.length > 0">
      <mat-card class="description-card">
        <mat-card-header>
          <mat-card-title>Generated Description</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <pre>{{ description }}</pre>
        </mat-card-content>
      </mat-card>

      <mat-card class="code-card" *ngIf="generatedFiles.length > 0">
        <mat-card-header>
          <mat-card-title>Generated Code</mat-card-title>
          <mat-card-subtitle>{{ generatedFiles.length }} file(s) generated</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="file-list">
            <mat-nav-list>
              <a mat-list-item 
                 *ngFor="let file of generatedFiles" 
                 (click)="selectFile(file)"
                 [class.selected]="selectedFile === file">
                <mat-icon matListItemIcon>{{ getFileIcon(file.filename) }}</mat-icon>
                <span matListItemTitle>{{ file.filename }}</span>
              </a>
            </mat-nav-list>
          </div>

          <div class="code-preview" *ngIf="selectedFile">
            <div class="code-header">
              <span>{{ selectedFile.filename }}</span>
              <button mat-icon-button 
                      (click)="copyText(codeElement)" 
                      matTooltip="Copy to clipboard">
                <mat-icon>content_copy</mat-icon>
              </button>
            </div>
            <div #codeElement>
              <app-dynamic-content 
                [dynamicHtml]="getFormattedHtml(selectedFile.content)"
                [dynamicCss]="getCodeStyles()">
              </app-dynamic-content>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .results {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }

    .description-card pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .file-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .selected {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .code-preview {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
  `]
})
export class CodePreviewComponent implements OnInit {
  description = '';
  generatedFiles: GeneratedFile[] = [];
  selectedFile: GeneratedFile | null = null;

  constructor(
    private codeGenerationService: CodeGenerationService,
    private fileManagementService: FileManagementService,
    private uiStateService: UiStateService
  ) {}

  ngOnInit(): void {
    this.uiStateService.description$.subscribe(
      description => this.description = description
    );

    this.codeGenerationService.generatedFiles$.subscribe(
      files => {
        this.generatedFiles = files;
        if (files.length > 0 && !this.selectedFile) {
          this.selectFile(files[0]);
        }
      }
    );

    this.fileManagementService.selectedFile$.subscribe(
      file => this.selectedFile = file
    );
  }

  selectFile(file: GeneratedFile): void {
    this.fileManagementService.selectFile(file);
  }

  getFileIcon(filename: string): string {
    return this.fileManagementService.getFileIcon(filename);
  }

  getFormattedHtml(content: string): string {
    return this.fileManagementService.getFormattedHtml(content);
  }

  getCodeStyles(): string {
    return this.fileManagementService.getCodeStyles();
  }

  copyText(element: HTMLElement): void {
    const text = element.textContent || '';
    navigator.clipboard.writeText(text);
  }
} 