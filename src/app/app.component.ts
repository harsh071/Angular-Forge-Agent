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
import { MatMenuModule } from '@angular/material/menu';
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
import { MatRippleModule } from '@angular/material/core';
// Material Popups & Modals
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
// Material Data tables
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { FormControl, FormsModule } from '@angular/forms';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { environment } from '../environments/environment.development';
import { HttpClient, HttpClientModule, HttpEventType } from '@angular/common/http';
import { Subscription, finalize } from 'rxjs';

const materialImports: string[] = [
  'MatAutocompleteModule',
  'MatCheckboxModule',
  'MatDatepickerModule',
  'MatFormFieldModule',
  'MatInputModule',
  'MatRadioModule',
  'MatSelectModule',
  'MatSliderModule',
  'MatSlideToggleModule',
  'MatMenuModule',
  'MatSidenavModule',
  'MatToolbarModule',
  'MatCardModule',
  'MatDividerModule',
  'MatExpansionModule',
  'MatGridListModule',
  'MatListModule',
  'MatStepperModule',
  'MatTabsModule',
  'MatTreeModule',
  'MatButtonModule',
  'MatButtonToggleModule',
  'MatBadgeModule',
  'MatChipsModule',
  'MatIconModule',
  'MatProgressSpinnerModule',
  'MatProgressBarModule',
  'MatRippleModule',
  'MatBottomSheetModule',
  'MatDialogModule',
  'MatSnackBarModule',
  'MatTooltipModule',
  'MatPaginatorModule',
  'MatSortModule',
  'MatTableModule',
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
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
  tasks: { name: string; completed: boolean }[] = [];
  imageDescription = '';
  file: string;
  formatedFiles: string[] = [];
  balance = 1000;
  points = 500;
  cards = [
    {
      number: '1234567890123456',
      type: 'Visa',
      balance: 500,
    },
    {
      number: '0987654321098765',
      type: 'Mastercard',
      balance: 1000,
    },
  ];
  transactions = [
    {
      date: '2023-03-08',
      description: 'Transfer to John Doe',
      amount: -100,
    },
    {
      date: '2023-03-07',
      description: 'Payment to Netflix',
      amount: -20,
    },
    {
      date: '2023-03-06',
      description: 'Deposit from Jane Doe',
      amount: 250,
    },
  ];
  title = 'Gemini Login';

  requiredFileType:string = 'image/png' || 'image/jpeg';
  fileName = '';

  constructor(private http: HttpClient, private fileConversionService: FileConversionService) {
    // this.initGemini();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.fileName = file.name;
      console.log(file)
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let base64data = reader.result as string;
        base64data = base64data.substring(base64data.indexOf(',') + 1)
        this.initGemini(base64data);
      };
    }
  }

  public async initGemini(file?: string) {
    const genAI = new GoogleGenerativeAI(environment.API_KEY);
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
      temperature: 0.9,
      top_p: 1,
      top_k: 32,
      maxOutputTokens: 100, // limit output
    };

    const model = genAI.getGenerativeModel({
      model: 'gemini-pro-vision', // or 'gemini-pro-vision'
      ...generationConfig,
    });
    // Model initialisation missing for brevity

    try {
      let imageBase64 = await this.fileConversionService.convertToBase64(
        'assets/goog.png'
      );

      // Check for successful conversion to Base64
      if (typeof imageBase64 !== 'string') {
        console.error('Image conversion to Base64 failed.');
        return;
      }
      // Model initialisation missing for brevity
      let prompt = [
        {
          inlineData: {
            mimeType: 'image/png',
            data: file? file: imageBase64,
          },
        },
        {
          text: 'Explain what kind of a web page is shown in the image above.' +
            'Be as descriptive as possible and include all the necessary details for gemini.',
        },
      ];

      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log(response);
      this.imageDescription = response.text();

      const model2 = genAI.getGenerativeModel({
        model: 'gemini-pro', // or 'gemini-pro-vision'
        ...generationConfig,
      });
      // Model initialisation missing for brevity
      prompt = [
        {
          text: 'Create a simple angular functional page with using Angular Material:' + this.imageDescription +
            + "Libraries:\
          Angular Material from material.angular.io." +
            "Constraints:\
          Do not include any unnecessary dependencies apart from Material Angular" +
            materialImports +
            "Focus on achieving the core functionality with minimal code" +
            "Output Format:\
          Three separate JSON files:\
          app.component.ts (TypeScript file for the component)\
          app.component.html (HTML file for the component template)\
          app.component.css (CSS file for the component styles)",
        },
      ];

      const result2 = await model2.generateContent(prompt);
      const response2 = await result2.response;
      this.parseFiles(response2.text().split('```'));
    } catch (error) {
      console.error('Error converting file to Base64', error);
    }
  }

  public parseFiles(files: string[]): void {
    let newTask = '';
    for (let i = 0; i < files.length; i += 2) {
      newTask += files[i] + files[i + 1] + '\n';
      this.formatedFiles.push(newTask);
      newTask = '';
    }
    console.log(this.formatedFiles)
    this.formatedFiles = this.formatedFiles.slice(0, this.formatedFiles.length - 1);
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
