import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

import { FileConversionService } from './file-conversion.service';

import { environment } from '../environments/environment.development';
import { materialImports } from './material-imports';
import { getPrompt } from './prompt';
import { FirestoreService } from './firestore-service.service';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  public imageDescription$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public imageDescription: string = '';
  public formatedFiles: string[] = [];
  public model;
  public genAI;
  public generationConfig;

  constructor(private http: HttpClient, private fileConversionService: FileConversionService, public  firestoreService: FirestoreService) {
    this.genAI = new GoogleGenerativeAI(environment.API_KEY);
    this.generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
    "max_output_tokens": 8192,
    "temperature": 1,
    "top_p": 0.95,
    };

    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-001', // or 'gemini-pro-vision'
      ...this.generationConfig,
    });
  }

  public async initGemini(file?: string,) {

    try {
      // Example image. 
      let imageBase64 = await this.fileConversionService.convertToBase64(
        'assets/goog.png'
      );

      // Check for successful conversion to Base64
      if (typeof imageBase64 !== 'string') {
        console.error('Image conversion to Base64 failed.');
        return;
      }

      let prompt = [
        {
          inlineData: {
            mimeType: 'image/png',
            data: file ? file : imageBase64,
          },
        },
        {
          text: 'Explain what kind of a web page is shown in the image above.' +
            'Be as descriptive as possible and include all the necessary details.' +
            'To create a super detailed description of a screenshot of a webpage, you should include the following elements:' + 
             `General Layout: Describe the overall structure, must headers, footers, sidebars, and main content areas. 
### Instruction ###

             ${getPrompt('header')}
              ${getPrompt('mainContent')}
              ${getPrompt('sidebarContent')}
              ${getPrompt('footerDetails')}
              ${getPrompt('interactiveElements')}
              ${getPrompt('colorsAndThemes')}
              ${getPrompt('additionalDetails')}

  ### Example Ouput format ###
              ${getPrompt('example2')}
             `
        },
      ];

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      this.imageDescription = response.text();
      this.imageDescription$.next(this.imageDescription);

      const model2 = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-pro-001', // or 'gemini-pro-vision'
        ...this.generationConfig,
      });

      prompt = [ 
//         {
//           text: `
//           Create Angular code using Angular Material (material.angular.io) to build a responsive user interface that includes the following components:

// Header:

// A top navigation bar with the website logo on the left and navigation links ("Home," "About Us," "Services," "Contact") on the right.
// Use the Angular Material mat-toolbar and mat-icon components.
// Sidebar:

// A collapsible sidebar that includes a user profile section at the top with a user avatar, name, and email.
// Below the profile section, include a list of links ("Dashboard," "Settings," "Help") using the Angular Material mat-sidenav and mat-list components.
// Main Content:

// A main content area displaying a grid of cards, each representing a service offered by the company. Each card should include an image, a title, a short description, and a button to read more.
// Use the Angular Material mat-grid-list and mat-card components.
// Footer:

// A footer with social media icons (Facebook, Twitter, LinkedIn) on the left and additional links ("Privacy Policy," "Terms of Service") on the right.
// Use the Angular Material mat-icon and mat-toolbar components for the footer.
// Description:

// The provided Angular code should create a responsive layout with a clean and modern look. The top navigation bar will use the mat-toolbar component to display the logo and navigation links. The sidebar will be implemented using the mat-sidenav component and will include user profile information and additional navigation links. The main content area will use a grid layout (mat-grid-list) to display service cards, each created with the mat-card component. The footer will use mat-toolbar and mat-icon components to display social media icons and additional links.

// // app.module.ts
// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatListModule } from '@angular/material/list';
// import { MatGridListModule } from '@angular/material/grid-list';
// import { MatCardModule } from '@angular/material/card';
// import { AppComponent } from './app.component';

// @NgModule({
//   declarations: [AppComponent],
//   imports: [
//     BrowserModule,
//     BrowserAnimationsModule,
//     MatToolbarModule,
//     MatIconModule,
//     MatSidenavModule,
//     MatListModule,
//     MatGridListModule,
//     MatCardModule
//   ],
//   providers: [],
//   bootstrap: [AppComponent]
// })
// export class AppModule { }

// // app.component.html
// <mat-toolbar color="primary">
//   <span class="logo">WebSiteName</span>
//   <span class="spacer"></span>
//   <a mat-button routerLink="/home">Home</a>
//   <a mat-button routerLink="/about">About Us</a>
//   <a mat-button routerLink="/services">Services</a>
//   <a mat-button routerLink="/contact">Contact</a>
// </mat-toolbar>

// <mat-sidenav-container>
//   <mat-sidenav mode="side" opened>
//     <mat-list>
//       <mat-list-item>
//         <mat-icon matListIcon>account_circle</mat-icon>
//         <div matLine>User Name</div>
//         <div matLine>user@example.com</div>
//       </mat-list-item>
//       <mat-divider></mat-divider>
//       <a mat-list-item routerLink="/dashboard">Dashboard</a>
//       <a mat-list-item routerLink="/settings">Settings</a>
//       <a mat-list-item routerLink="/help">Help</a>
//     </mat-list>
//   </mat-sidenav>

//   <mat-sidenav-content>
//     <mat-grid-list cols="3" rowHeight="350px">
//       <mat-grid-tile *ngFor="let service of services">
//         <mat-card>
//           <img mat-card-image [src]="service.image" alt="{{ service.title }}">
//           <mat-card-title>{{ service.title }}</mat-card-title>
//           <mat-card-content>{{ service.description }}</mat-card-content>
//           <mat-card-actions>
//             <button mat-button>Read More</button>
//           </mat-card-actions>
//         </mat-card>
//       </mat-grid-tile>
//     </mat-grid-list>
//   </mat-sidenav-content>
// </mat-sidenav-container>

// <mat-toolbar color="primary" class="footer">
//   <span class="social-media-icons">
//     <mat-icon>facebook</mat-icon>
//     <mat-icon>twitter</mat-icon>
//     <mat-icon>linkedin</mat-icon>
//   </span>
//   <span class="spacer"></span>
//   <a mat-button routerLink="/privacy">Privacy Policy</a>
//   <a mat-button routerLink="/terms">Terms of Service</a>
// </mat-toolbar>

// // app.component.ts
// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   services = [
//     { image: 'service1.jpg', title: 'Service 1', description: 'Description of Service 1' },
//     { image: 'service2.jpg', title: 'Service 2', description: 'Description of Service 2' },
//     { image: 'service3.jpg', title: 'Service 3', description: 'Description of Service 3' },
//     // Add more services as needed
//   ];
// }

//           `
//         },
        {
          text: 'Create a simple angular functional page with using Material Angular:' + this.imageDescription +
            "Constraints: "+
            materialImports +
            `Focus on achieving the core functionality with minimal code, make sure all the files work and compile
            ### Output Format: ###
          The Output should not contain any extra space or new line characters
          All strings must be double quotes, not single quotes and not backticks
          Three separate files in json output as such filename and code:
          app.component.ts (TypeScript file for the component)
          app.component.html (HTML file for the component template)
          app.component.css (CSS file for the component styles)

          THE OUTPUT HAS TO BE in the following format, the whole output shoule be parsed as JSON string, there should be no errors on JSON.parse:
          [{filename: 'app.component.ts', content: '...'}, {filename: 'app.component.html', content: '...'}, {filename: 'app.component.css', content: '...'}]
          `,
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
    // Split the files into pairs of two: name and content
    for (let i = 0; i < files.length; i += 2) {
      newTask += files[i] + files[i + 1] + '\n';
      this.formatedFiles.push(newTask);
      newTask = '';
    }

    this.formatedFiles = this.formatedFiles.slice(0, this.formatedFiles.length - 1);
    let randomNumber = Math.floor(Math.random() * 1000);
    this.firestoreService.addData('items', 'description-code', { [randomNumber]: {
      description: this.imageDescription,
      code: this.formatedFiles,
    }});

  }
}
