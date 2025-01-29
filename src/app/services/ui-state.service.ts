import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GeneratedFile } from './code-generation.service';

export interface CodeSnippet {
  filename: string;
  title: string;
  content: GeneratedFile[];
}

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  private descriptionSubject = new BehaviorSubject<string>('');
  description$ = this.descriptionSubject.asObservable();

  private codeSnippetsSubject = new BehaviorSubject<CodeSnippet[]>([]);
  codeSnippets$ = this.codeSnippetsSubject.asObservable();

  private activeTabSubject = new BehaviorSubject<number>(0);
  activeTab$ = this.activeTabSubject.asObservable();

  constructor() {}

  setDescription(description: string): void {
    this.descriptionSubject.next(description);
  }

  setCodeSnippets(snippets: CodeSnippet[]): void {
    this.codeSnippetsSubject.next(snippets);
  }

  setActiveTab(index: number): void {
    this.activeTabSubject.next(index);
  }

  generateSnippetTitle(description: string): string {
    const maxLength = 50;
    const words = description.split(' ');
    let title = '';
    
    for (const word of words) {
      if ((title + word).length <= maxLength) {
        title += (title ? ' ' : '') + word;
      } else {
        break;
      }
    }
    
    return title + (title.length < description.length ? '...' : '');
  }
} 