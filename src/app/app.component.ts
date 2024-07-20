import { GeminiService } from './gemini.service';
import { FileConversionService } from './file-conversion.service';
import { Component } from '@angular/core';
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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
// Material Data tables
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { environment, firestoreConfig } from '../environments/environment.development';
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
  content: string;
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
export class AppComponent {
  imageDescription = '';
  file: string;
  requiredFileType: string = 'image/png' || 'image/jpeg';
  fileName = '';
  items$: Observable<any>;
  codeList: any;
  codeListKeys: any;
  codeSnippets: CodeSnippet[] = [];

  itemsCollection: any;
  code = `<mat-toolbar color="primary">
  <span class="logo">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png" alt="Wikipedia Logo">
    Wikipedia The Free Encyclopedia
  </span>
  <span class="search-bar">
    <mat-form-field appearance="outline">
      <input matInput placeholder="Search Wikipedia">
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>
  </span>
  <span class="user-options">
    <button mat-button>Create account</button>
    <button mat-button>Log in</button>
    <mat-icon>more_vert</mat-icon>
  </span>
</mat-toolbar>

<div class="content">
  <div class="banner">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Compass_Rose_English.svg/120px-Compass_Rose_English.svg.png" alt="Compass Image">
    <div>
      <h2>Wikidata Contest</h2>
      <p>Coordinate Me</p>
      <p>May 2024</p>
    </div>
  </div>

  <mat-tab-group>
    <mat-tab label="Main Page">
      <div class="welcome-message">
        <h1>Welcome to Wikipedia, the free encyclopedia that anyone can edit.</h1>
        <p>6,827,785 articles in English</p>
      </div>

      <mat-card class="featured-article">
        <mat-card-header>
          <mat-card-title>From today's featured article</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/SMS_Lothringen_1916.jpg/320px-SMS_Lothringen_1916.jpg" alt="SMS Lothringen">
          <p>Content about SMS Lothringen...</p>
        </mat-card-content>
      </mat-card>

      <mat-card class="in-the-news">
        <mat-card-header>
          <mat-card-title>In the news</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <ul>
            <li>Landslide in Papua New Guinea</li>
            <li>European Union passes Artificial Intelligence Act</li>
            <li>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Ebrahim_Raisi_2022.jpg/220px-Ebrahim_Raisi_2022.jpg" alt="Ebrahim Raisi">
              Helicopter crash in Iran
            </li>
          </ul>
        </mat-card-content>
      </mat-card>
    </mat-tab>
    <mat-tab label="Talk">Content for Talk tab</mat-tab>
  </mat-tab-group>

  <div class="page-tools">
    <a href="#">Read</a>
    <a href="#">View source</a>
    <a href="#">View history</a>
    <a href="#">Tools</a>
  </div>
</div>
`
  constructor(
    public geminiService: GeminiService,
    public firestore: Firestore,
    public firestoreService: FirestoreService
  ) {
    // firestoreService.addData('items', 'description-code', { capital: 'it' });
    this.itemsCollection = this.firestoreService.getData(
      'items',
      'description-code'
    );
    this.firestoreService.itemsCollection.subscribe((data) => {
      this.codeList = data;
      this.codeListKeys = Object.keys(this.codeList);
      // use the following to get the code snippets in code
      // console.log(JSON.parse(this.codeList['428']?.code[0].slice(5, -1)))
      this.codeListKeys.forEach((key) => {
        let code = JSON.parse(this.codeList[key].code[0].slice(5, -1));
        console.log(this.codeList[key], key, this.codeList)
        console.log(code)
        this.codeSnippets.push({
          filename: code.filename,
          content: code.content,
        });
      });

    });
  }
  
  // parseAngularFiles(jsonData: string): AngularFile[] | null {
  //   try {
  // WORKS:       console.log(JSON.parse(this.codeList['428']?.code[0].slice(5, -1)))
  //       // Remove the 'json' and extra line breaks from the beginning and the end of the string
  //       jsonData = jsonData.trim().replace(/^json\\n/, '').replace(/\\n\\n$/, '');
  //       console.log(typeof jsonData);
  //       // Parse the JSON data
  //       const parsedData = JSON.parse(jsonData);
        
  //       // Check if 'code' key exists and is an array
  //       if (Array.isArray(parsedData.code)) {
  //           return parsedData.code.map(file => ({
  //               filename: file.filename,
  //               content: file.content
  //           }));
  //       } else {
  //           console.error('Invalid format: JSON does not contain \'code\' array');
  //           return null;
  //       }
  //   } catch (error) {
  //       console.error('Error parsing JSON', error);
  //       return null;
  //   }
  // }

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

  public copyText(textElement: HTMLDivElement): void {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(textElement);
    selection?.removeAllRanges();
    selection?.addRange(range);

    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'successful' : 'unsuccessful';
      console.log('Copying text command was ' + msg);
    } catch (err) {
      console.log('Oops, unable to copy');
    }

    // Clear selection if you do not want it to remain in the document after copy
    selection?.removeAllRanges();
  }
}
