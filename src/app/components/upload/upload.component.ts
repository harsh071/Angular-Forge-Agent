import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
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
    MatProgressBarModule,
    MatRippleModule
  ],
  template: `
    <div class="upload-container">
      <div class="upload-section">
        <div class="section-header">
          <h2>Create Your UI</h2>
          <p class="subtitle">Upload a screenshot or describe your desired interface</p>
        </div>

        <div class="input-methods">
          <div class="upload-area" 
               matRipple
               [matRippleCentered]="true"
               [matRippleUnbounded]="false"
               (click)="fileInput.click()"
               [class.uploading]="isLoading">
            <input type="file" 
                   accept="image/*" 
                   (change)="handleFileUpload($event)" 
                   #fileInput 
                   [style.display]="'none'">
            <div class="upload-content">
              <mat-icon class="upload-icon">cloud_upload</mat-icon>
              <span class="upload-text">Drop screenshot here or click to upload</span>
              <span class="upload-hint">Supports PNG, JPG up to 10MB</span>
            </div>
            <mat-progress-bar *ngIf="isLoading" 
                            mode="indeterminate" 
                            class="upload-progress"></mat-progress-bar>
          </div>

          <div class="divider">
            <span>or</span>
          </div>

          <div class="prompt-area">
            <mat-form-field appearance="outline" class="prompt-field">
              <mat-label>Describe your webpage</mat-label>
              <textarea matInput
                        [(ngModel)]="textPrompt"
                        placeholder="e.g. A modern landing page with a hero section, features grid, and a contact form..."
                        [disabled]="isLoading"
                        rows="4"></textarea>
              <mat-icon matSuffix 
                        [class.active]="textPrompt.length > 0"
                        (click)="handleTextPrompt()"
                        *ngIf="!isLoading">send</mat-icon>
              <mat-progress-bar *ngIf="isLoading" 
                              mode="indeterminate" 
                              class="prompt-progress"></mat-progress-bar>
            </mat-form-field>
          </div>
        </div>

        <div *ngIf="error" class="error-message">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .upload-section {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .section-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .section-header h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .subtitle {
      color: #6b7280;
      font-size: 1.1rem;
      margin: 0;
    }

    .input-methods {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .upload-area {
      border: 2px dashed #e5e7eb;
      border-radius: 12px;
      padding: 40px 24px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;

      &:hover {
        border-color: #2563eb;
        background: #f8fafc;

        .upload-icon {
          transform: translateY(-2px);
        }
      }

      &.uploading {
        border-style: solid;
        border-color: #2563eb;
        background: #f0f7ff;
      }
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #2563eb;
      transition: transform 0.2s ease;
    }

    .upload-text {
      font-size: 1.1rem;
      font-weight: 500;
      color: #1a1a1a;
    }

    .upload-hint {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .upload-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;

      &::before,
      &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #e5e7eb;
      }

      span {
        margin: 0 16px;
      }
    }

    .prompt-area {
      position: relative;
    }

    .prompt-field {
      width: 100%;
    }

    ::ng-deep {
      .prompt-field {
        .mat-mdc-form-field-subscript-wrapper {
          display: none;
        }

        .mat-mdc-text-field-wrapper {
          background: #f8fafc;
          transition: all 0.2s ease;

          &:hover {
            background: #f0f7ff;
          }
        }

        .mat-mdc-form-field-flex {
          padding-right: 48px;
        }
      }
    }

    .mat-icon[matSuffix] {
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s ease;

      &:hover {
        color: #2563eb;
        transform: translateX(2px);
      }

      &.active {
        color: #2563eb;
      }
    }

    .prompt-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px 16px;
      background: #fef2f2;
      border: 1px solid #fee2e2;
      border-radius: 8px;
      color: #dc2626;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
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