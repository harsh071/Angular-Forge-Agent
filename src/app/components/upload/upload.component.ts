import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CodeGenerationService } from '../../services/code-generation.service';
import { FileManagementService } from '../../services/file-management.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule
  ],
  template: `
    <mat-card class="upload-card">
      <mat-card-header>
        <mat-card-title>Upload Screenshot or Enter Text Prompt</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="input-options">
          <div class="file-upload">
            <input type="file" 
                   accept="image/*" 
                   (change)="handleFileUpload($event)" 
                   #fileInput 
                   [style.display]="'none'">
            <button mat-raised-button 
                    color="primary" 
                    (click)="fileInput.click()"
                    [disabled]="isLoading">
              <mat-icon>upload</mat-icon>
              Upload Screenshot
            </button>
          </div>

          <div class="text-prompt">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Enter your webpage description</mat-label>
              <textarea matInput
                       [(ngModel)]="textPrompt"
                       placeholder="Describe the webpage you want to create..."
                       [disabled]="isLoading"
                       rows="4"></textarea>
            </mat-form-field>
            <button mat-raised-button 
                    color="accent"
                    (click)="handleTextPrompt()"
                    [disabled]="isLoading || !textPrompt">
              <mat-icon>description</mat-icon>
              Generate from Text
            </button>
          </div>
        </div>

        <mat-progress-bar *ngIf="isLoading" mode="indeterminate"></mat-progress-bar>
        
        <mat-error *ngIf="error">{{ error }}</mat-error>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .upload-card {
      margin: 16px;
    }

    .input-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 16px;
    }

    .file-upload {
      display: flex;
      justify-content: center;
    }

    .text-prompt {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .full-width {
      width: 100%;
    }

    mat-error {
      margin-top: 8px;
    }
  `]
})
export class UploadComponent {
  textPrompt = '';
  isLoading = false;
  error: string | null = null;

  constructor(
    private codeGenerationService: CodeGenerationService,
    private fileManagementService: FileManagementService
  ) {
    this.codeGenerationService.isLoading$.subscribe(
      loading => this.isLoading = loading
    );
    this.codeGenerationService.error$.subscribe(
      error => this.error = error
    );
  }

  async handleFileUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      try {
        const base64Image = await this.fileManagementService.readFileAsBase64(file);
        await this.codeGenerationService.generateFromImage(base64Image);
      } catch (error) {
        console.error('Error handling file upload:', error);
        this.error = 'Failed to process the image. Please try again.';
      }
    }
  }

  async handleTextPrompt(): Promise<void> {
    if (this.textPrompt.trim()) {
      try {
        await this.codeGenerationService.generateFromText(this.textPrompt);
        this.textPrompt = '';
      } catch (error) {
        console.error('Error handling text prompt:', error);
        this.error = 'Failed to generate code. Please try again.';
      }
    }
  }
} 