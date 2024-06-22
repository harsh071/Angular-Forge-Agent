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
import { FormsModule } from '@angular/forms';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { environment, firestoreConfig } from '../environments/environment.development';
import { HttpClient, HttpClientModule, HttpEventType } from '@angular/common/http';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable, first } from 'rxjs';
import { FirestoreService } from './firestore-service.service';


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
  imageDescription = '';
  file: string;
  requiredFileType: string = 'image/png' || 'image/jpeg';
  fileName = '';
  items$: Observable<any[]>;

  constructor(public geminiService: GeminiService, public firestore: Firestore, public firestoreService: FirestoreService) {
    // this.items$ = collectionData(itemsCollection);
    // this.items$.subscribe((items) => console.log(items));
    firestoreService.addData('items', 'document', { capital: 'it' });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();  
      reader.readAsDataURL(file);
      reader.onload = () => {
        let base64data = reader.result as string;
        base64data = base64data.substring(base64data.indexOf(',') + 1)
        this.geminiService.initGemini(base64data);
        this.geminiService.imageDescription$.subscribe((description) => {
          this.imageDescription = description;
          let randomNumber = Math.floor(Math.random() * 1000);
          //save imageDescription to local storage
          localStorage.setItem('imageDescription', this.imageDescription);
          console.log(localStorage.getItem('imageDescription'));
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
