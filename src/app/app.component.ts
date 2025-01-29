import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { UploadComponent } from './components/upload/upload.component';
import { CodePreviewComponent } from './components/code-preview/code-preview.component';
import { CodeSnippetsComponent } from './components/code-snippets/code-snippets.component';
import { CodeGenerationService } from './services/code-generation.service';
import { UiStateService } from './services/ui-state.service';
import { FirestoreService } from './firestore-service.service';
import { Firestore } from '@angular/fire/firestore';

interface AngularFile {
  filename: string;
  content: string;
}

interface CodeSnippet {
  filename: string;
  title: string;
  content: GeneratedFile[];
}

interface GeneratedFile {
  filename: string;
  content: string;
}

interface FirestoreData {
  code: string[] | GeneratedFile[];
  description: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatTabsModule,
    UploadComponent,
    CodePreviewComponent,
    CodeSnippetsComponent
  ],
  template: `
    <mat-toolbar color="primary">
      <span>LibgenUI</span>
    </mat-toolbar>

    <div class="container">
      <mat-tab-group [selectedIndex]="activeTab" (selectedIndexChange)="onTabChange($event)">
        <mat-tab label="Upload">
          <div class="tab-content">
            <app-upload></app-upload>
          </div>
        </mat-tab>

        <mat-tab label="Generated Code" [disabled]="!hasGeneratedCode">
          <div class="tab-content">
            <app-code-preview></app-code-preview>
          </div>
        </mat-tab>

        <mat-tab label="Code Snippets">
          <div class="tab-content">
            <app-code-snippets [codeSnippets]="codeSnippets"></app-code-snippets>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .container {
      height: calc(100vh - 64px);
      overflow: hidden;
    }

    .tab-content {
      height: calc(100vh - 112px);
      overflow-y: auto;
    }
  `]
})
export class AppComponent {
  activeTab = 0;
  hasGeneratedCode = false;
  hasCodeSnippets = false;
  codeList: any;
  codeListKeys: any;
  codeSnippets: any[] = [];
  generatedFiles: GeneratedFile[] = [];
  selectedFile: GeneratedFile | null = null;
  description: string = '';
  itemsCollection: any;

  constructor(
    private codeGenerationService: CodeGenerationService,
    private uiStateService: UiStateService,
    public firestore: Firestore,
    public firestoreService: FirestoreService,
  ) {
    this.codeGenerationService.generatedFiles$.subscribe(
      files => this.hasGeneratedCode = files.length > 0
    );

    this.uiStateService.codeSnippets$.subscribe(
      snippets => this.hasCodeSnippets = snippets.length > 0
    );

    this.uiStateService.activeTab$.subscribe(
      index => this.activeTab = index
    );

    this.itemsCollection = this.firestoreService.getData(
      'items',
      'description-code'
    );
    console.log('Items collection:', this.itemsCollection.subscribe(e => console.log(e)));
    this.itemsCollection.subscribe((data) => {
      this.codeList = data;
      this.codeListKeys = Object.keys(this.codeList);
      this.codeSnippets = [];
      this.generatedFiles = [];
      console.log('Code list keys:', this.codeListKeys);
      this.codeListKeys.forEach((key) => {
        try {
          // Handle the code array from Firebase
          const codeData = this.codeList[key];

          // Set description
          if (codeData.description) {
            this.description = codeData.description;
          }
          console.log('Description:', this.description);
          // For backward compatibility
          this.codeSnippets.push({
            filename: key,
            title: this.generateSnippetTitle(codeData.description || 'Code Snippet'),
            content: codeData.code
          });
          console.log('Code snippets:', this.codeSnippets);

        } catch (error) {
          console.error(`Error parsing code for key ${key}:`, error);
        }
      });

      // Select the first file by default if available
      if (this.generatedFiles.length > 0 && !this.selectedFile) {
        this.selectedFile = this.generatedFiles[0];
        console.log('Selected file:', this.selectedFile);
      }
    });
  }

  onTabChange(index: number): void {
    this.uiStateService.setActiveTab(index);
  }

  private generateSnippetTitle(description: string): string {
    // Extract first sentence or first 50 characters
    const firstSentence = description.split(/[.!?]/).filter(s => s.trim())[0] || '';
    return firstSentence.length > 50 ? firstSentence.substring(0, 47) + '...' : firstSentence;
  }
}
