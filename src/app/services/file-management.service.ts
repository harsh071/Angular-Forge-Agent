import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GeneratedFile } from './code-generation.service';

@Injectable({
  providedIn: 'root'
})
export class FileManagementService {
  private selectedFileSubject = new BehaviorSubject<GeneratedFile | null>(null);
  selectedFile$ = this.selectedFileSubject.asObservable();

  constructor() {}

  selectFile(file: GeneratedFile): void {
    this.selectedFileSubject.next(file);
  }

  getFileIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'html':
        return 'html';
      case 'ts':
        return 'code';
      case 'scss':
      case 'css':
        return 'style';
      default:
        return 'description';
    }
  }

  getLanguage(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'html':
        return 'html';
      case 'ts':
        return 'typescript';
      case 'scss':
        return 'scss';
      case 'css':
        return 'css';
      default:
        return 'plaintext';
    }
  }

  async readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64data = reader.result as string;
        resolve(base64data.substring(base64data.indexOf(',') + 1));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  getFormattedHtml(content: string): string {
    return this.escapeHtml(content)
      .replace(/\n/g, '<br>')
      .replace(/\s/g, '&nbsp;');
  }

  getCodeStyles(): string {
    return `
      pre {
        background-color: #f5f5f5;
        border-radius: 4px;
        padding: 16px;
        margin: 0;
        overflow-x: auto;
        font-family: 'Courier New', Courier, monospace;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        background-color: #e0e0e0;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
      }
      
      .code-preview {
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        margin-top: 16px;
      }
    `;
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
} 