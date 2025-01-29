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

        <mat-tab label="Code Snippets" [disabled]="!hasCodeSnippets">
          <div class="tab-content">
            <app-code-snippets></app-code-snippets>
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

  constructor(
    private codeGenerationService: CodeGenerationService,
    private uiStateService: UiStateService
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
  }

  onTabChange(index: number): void {
    this.uiStateService.setActiveTab(index);
  }
}
