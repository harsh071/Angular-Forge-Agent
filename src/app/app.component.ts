import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { UploadComponent } from './components/upload/upload.component';
import { CodePreviewComponent } from './components/code-preview/code-preview.component';
import { CodeSnippetsComponent } from './components/code-snippets/code-snippets.component';
import { CodeGenerationService } from './services/code-generation.service';
import { UiStateService } from './services/ui-state.service';
import { FirestoreService } from './firestore-service.service';
import { Firestore } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { SSEService } from './services/ws.service';

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
    MatIconModule,
    UploadComponent,
    CodePreviewComponent,
    CodeSnippetsComponent
  ],
  template: `
    <div class="app-container">
      <mat-toolbar class="toolbar">
        <div class="toolbar-content">
          <span class="logo">LibgenUI</span>
          <div class="toolbar-actions">
            <button mat-icon-button (click)="sendEvent()">
              <mat-icon>send</mat-icon>
            </button>
          </div>
        </div>
      </mat-toolbar>

      <div class="main-content">
        <mat-tab-group 
          [selectedIndex]="activeTab" 
          (selectedIndexChange)="onTabChange($event)"
          class="modern-tabs"
          animationDuration="200ms">
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">upload</mat-icon>
              <span class="tab-label">Upload</span>
            </ng-template>
            <div class="tab-content">
              <app-upload></app-upload>
              
              <div class="events-container" *ngIf="events.length > 0">
                <h3 class="events-title">Activity Log</h3>
                <div class="events-list">
                  <div *ngFor="let event of events" class="event-card">
                    <div class="event-header">
                      <span class="event-type">{{ event.type }}</span>
                      <span class="event-time">{{ event.timestamp | date:'short' }}</span>
                    </div>
                    <div class="event-data">{{ event | json }}</div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <mat-tab [disabled]="!hasGeneratedCode">
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">code</mat-icon>
              <span class="tab-label">Generated Code</span>
            </ng-template>
            <div class="tab-content">
              <app-code-preview></app-code-preview>
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">library_books</mat-icon>
              <span class="tab-label">Code Snippets</span>
            </ng-template>
            <div class="tab-content">
              <app-code-snippets [codeSnippets]="codeSnippets"></app-code-snippets>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      background-color: #fafafa;
      display: flex;
      flex-direction: column;
    }

    .toolbar {
      background-color: white;
      border-bottom: 1px solid #eaeaea;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      height: 64px;
    }

    .toolbar-content {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }

    .main-content {
      flex: 1;
      overflow: hidden;
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .modern-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .tab-icon {
      margin-right: 8px;
    }

    .tab-label {
      font-weight: 500;
    }

    .tab-content {
      padding: 24px;
      height: calc(100vh - 200px);
      overflow-y: auto;
    }

    .events-container {
      margin-top: 32px;
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .events-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 16px 0;
    }

    .events-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .event-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #eaeaea;
    }

    .event-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .event-type {
      font-weight: 500;
      color: #2563eb;
    }

    .event-time {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .event-data {
      font-family: 'SF Mono', 'Roboto Mono', monospace;
      font-size: 0.875rem;
      color: #4b5563;
      background: #ffffff;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #eaeaea;
      overflow-x: auto;
    }

    ::ng-deep {
      .mat-mdc-tab-header {
        --mdc-tab-indicator-active-indicator-color: #2563eb;
        --mat-tab-header-active-label-text-color: #2563eb;
        --mat-tab-header-active-ripple-color: #2563eb;
        --mat-tab-header-inactive-label-text-color: #6b7280;
        --mat-tab-header-active-focus-label-text-color: #2563eb;
        --mat-tab-header-active-hover-label-text-color: #2563eb;
        --mat-tab-header-active-background-color: transparent;
      }

      .mat-mdc-tab-group {
        --mdc-tab-indicator-active-indicator-height: 2px;
      }

      .mat-mdc-tab {
        height: 48px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
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

  events: any[] = [];
  message: string = '';
  private sseSubscription: Subscription;

  constructor(
    private codeGenerationService: CodeGenerationService,
    private uiStateService: UiStateService,
    public firestore: Firestore,
    public firestoreService: FirestoreService,
    private ngZone: NgZone,
    private sseService: SSEService
  ) {
    this.codeGenerationService.generatedFiles$.subscribe(
      (files) => {
        this.hasGeneratedCode = files.length > 0;
        this.generatedFiles = files;
        this.sendToMyAgent(this.generatedFiles);
      }
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


  ngOnInit() {
    this.sseSubscription = this.sseService.connect()
      .subscribe({
        next: (event) => {
          this.events.unshift(event); // Add new events at the top
          this.callAgent(event);
          if (this.events.length > 50) {
            this.events.pop(); // Keep only last 50 events
          }

          console.log('Received event:', event);
        },
        error: (error) => {
          console.error('SSE Error:', error);
        }
      });
  }

  async sendEvent() {
      await this.sseService.triggerEvent({
        type: 'userMessage',
        message: 'How are you?',
        timestamp: new Date().toISOString()
      });
      this.message = '';
  }

  onTabChange(index: number): void {
    this.uiStateService.setActiveTab(index);
  }

  private generateSnippetTitle(description: string): string {
    // Extract first sentence or first 50 characters
    const firstSentence = description.split(/[.!?]/).filter(s => s.trim())[0] || '';
    return firstSentence.length > 50 ? firstSentence.substring(0, 47) + '...' : firstSentence;
  }


  async callAgent(event: any) {
    await this.codeGenerationService.generateFromText(event.input);
  }

  async sendToMyAgent(generatedFiles: GeneratedFile[]) {
    this.events[0].artifacts = generatedFiles;
    const response = await fetch('http://localhost:3000/ap/v1/agent/tasks/1/steps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': 'Bearer your-token-here'
      },
      body: JSON.stringify({
        "taskIds": 1,
        "stepId": 1,
        "input": this.events[0]
      }),
      // Add additional fetch options if needed
      credentials: 'include', // Handles cookies if required
      mode: 'cors', // Explicitly state CORS mode
      cache: 'no-cache', // Prevent caching of POST requests
    });

    const responseData = await response.json();
    console.log('Event triggered successfully');
    console.log('Response:', responseData);
  }
}
