import { GeminiService } from './gemini.service';
import { FileConversionService } from './file-conversion.service';
import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Material Form Controls
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// Material Navigation
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
// Material Layout
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
// Material Buttons & Indicators
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
// Material Popups & Modals
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
// Material Data tables
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { HttpClient, HttpClientModule, HttpEventType } from '@angular/common/http';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable, first } from 'rxjs';
import { FirestoreService } from './firestore-service.service';
import { DynamicContentComponent } from './dynamic-content.component';

interface AngularFile {
  filename: string;
  content: string;
}

interface CodeSnippet {
  filename: string;
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
    DynamicContentComponent,
    MatNativeDateModule,
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatListModule,
    MatStepperModule,
    MatTabsModule,
    MatTreeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatBadgeModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatRippleModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [FileConversionService, HttpClient, HttpClientModule],
})
export class AppComponent implements OnInit {
  imageDescription = '';
  file: string;
  requiredFileType: string = 'image/png' || 'image/jpeg';
  fileName = '';
  items$: Observable<any>;
  codeList: any;
  codeListKeys: any;
  codeSnippets: any[] = [];

  itemsCollection: any;
  code = ``
  description: string = '';
  generatedFiles: GeneratedFile[] = [];
  selectedFile: GeneratedFile | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    public geminiService: GeminiService,
    public firestore: Firestore,
    public firestoreService: FirestoreService,
    private _snackBar: MatSnackBar
  ) {
    this.itemsCollection = this.firestoreService.getData(
      'items',
      'description-code'
    );
    this.firestoreService.itemsCollection.subscribe((data) => {
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

          // For backward compatibility
          this.codeSnippets.push({
            filename: key,
            content: codeData.code
          });

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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let base64data = reader.result as string;
        base64data = base64data.substring(base64data.indexOf(',') + 1);
        this.geminiService.initGemini(base64data);
        this.geminiService.imageDescription$.subscribe((description) => {
          this.imageDescription = description;
          //save imageDescription to local storage
        });
      };
    }
  }

  public copyText(element: HTMLElement): void {
    try {
      const text = element.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        this._snackBar.open('Code copied to clipboard', 'Close', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      });
    } catch (err) {
      console.error('Failed to copy text:', err);
      this._snackBar.open('Failed to copy code', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
  }

  ngOnInit() {
    this.geminiService.imageDescription$.subscribe(
      description => this.description = description
    );

    // Handle generated code updates
    if (Array.isArray(this.geminiService.formatedFiles)) {
      console.log('Formated files:', this.geminiService.formatedFiles);
      this.processGeneratedFiles(this.geminiService.formatedFiles);
    }

  }

  private processGeneratedFiles(files: string[]): void {
    if (files && files.length > 0) {
      try {
        const parsedFiles = this.parseCodeFiles(files[0]);
        if (parsedFiles) {
          this.generatedFiles = parsedFiles;
          this.selectedFile = parsedFiles[0];
          console.log('Parsed files:', this.generatedFiles);
        }
      } catch (error) {
        console.error('Error parsing generated files:', error);
      }
    }
  }

  private parseCodeFiles(codeString: string): GeneratedFile[] | null {
    try {
      const startIndex = codeString.indexOf('[{');
      const endIndex = codeString.lastIndexOf('}]') + 2;
      if (startIndex === -1 || endIndex === 1) return null;
      
      const jsonStr = codeString.substring(startIndex, endIndex);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing code string:', error);
      return null;
    }
  }

  async handleFileUpload(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    this.isLoading = true;
    this.error = null;
    
    try {
      const base64String = await this.readFileAsBase64(file);
      if (base64String) {
        await this.geminiService.initGemini(base64String);
      }
    } catch (error: any) {
      this.error = error.message || 'An error occurred while processing the image';
      console.error('Error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private readFileAsBase64(file: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = (e.target?.result as string)?.split(',')[1];
        resolve(base64String || null);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  selectFile(file: GeneratedFile) {
    this.selectedFile = file;
  }

  getFileIcon(filename: string): string {
    if (filename.endsWith('.ts')) return 'code';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.scss')) return 'brush';
    return 'description';
  }

  getLanguage(filename: string): string {
    if (filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.scss')) return 'scss';
    return 'text';
  }

  getFormattedHtml(content: string): string {
    const language = this.selectedFile ? this.getLanguage(this.selectedFile.filename) : 'text';
    return `
        ${this.escapeHtml(content)}
      </code></pre>
    `;
  }

  getCodeStyles(): string {
    return `
      pre {
        margin: 0;
        padding: 16px;
        background: #1e1e1e;
        border-radius: 4px;
        overflow-x: auto;
      }
      
      code {
        font-family: 'Fira Code', monospace;
        font-size: 14px;
        line-height: 1.5;
        color: #d4d4d4;
      }

      .language-typescript .keyword { color: #569cd6; }
      .language-typescript .string { color: #ce9178; }
      .language-typescript .number { color: #b5cea8; }
      .language-typescript .comment { color: #6a9955; }
      
      .language-html .tag { color: #569cd6; }
      .language-html .attr-name { color: #9cdcfe; }
      .language-html .attr-value { color: #ce9178; }
      
      .language-scss .property { color: #9cdcfe; }
      .language-scss .value { color: #ce9178; }
      .language-scss .variable { color: #4ec9b0; }
    `;
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      // .replace(/&/g, "&amp;")
      // .replace(/</g, "&lt;")
      // .replace(/>/g, "&gt;")
      // .replace(/"/g, "&quot;")
      // .replace(/'/g, "&#039;");
  }

  private initializeFirestoreSubscription(): void {
    this.firestoreService.getData('items', 'description-code')
      .subscribe((data: Record<string, FirestoreData>) => {
        try {
          console.log('Firestore data:', data);

          // Get the most recent entry
          const entries = Object.entries(data);
          if (entries.length > 0) {
            const [_, latestData] = entries[entries.length - 1];
            
            // Handle code data
            if (latestData.code && latestData.code.length > 0) {
              if (typeof latestData.code[0] === 'string') {
                // Handle old format where code is a string array
                const parsedFiles = this.parseCodeFiles(latestData.code[0] as string);
                if (parsedFiles) {
                  this.generatedFiles = parsedFiles;
                  console.log('Parsed files:', this.generatedFiles);
                }
              } else {
                // Handle new format where code is already an array of GeneratedFile
                this.generatedFiles = latestData.code as GeneratedFile[];
              }
            }

            // Handle description
            if (latestData.description) {
              this.description = latestData.description;
            }

            // Select first file by default
            if (this.generatedFiles.length > 0 && !this.selectedFile) {
              this.selectedFile = this.generatedFiles[0];
              console.log('Selected file:', this.selectedFile);
            }
          }
        } catch (error) {
          console.error('Error processing Firestore data:', error);
          this.error = 'Error loading saved code';
        }
      });
  }
}
