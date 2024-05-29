import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

import { FileConversionService } from './file-conversion.service';

import { environment } from '../environments/environment.development';
import { materialImports } from './material-imports';

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

  constructor(private http: HttpClient, private fileConversionService: FileConversionService) {
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
             `General Layout: Describe the overall structure, such as headers, footers, sidebars, and main content areas.
             Header Details: Mention any logos, navigation menus, search bars, and additional elements in the header.
             Main Content: Describe the primary content, including text, images, videos, and other media. Mention specific text content, font styles, and sizes.
             Sidebar Content: Detail any sidebar content such as ads, additional navigation links, or featured articles.
             Footer Details: Include descriptions of footer content like copyright information, additional navigation, and social media links.
             Interactive Elements: Note any buttons, links, forms, or other interactive elements and their states (e.g., hover effects).
             Colors and Themes: Describe the color scheme, background colors, and any thematic elements.
             Additional Details: Include any pop-ups, notifications, or other dynamic elements visible in the screenshot \n'
             Here's an example of a super detailed description:
             The webpage screenshot displays a well-organized layout with a prominent header, main content area, sidebar, and footer.
             Header:
             Logo: Positioned at the top-left corner, featuring a blue and white logo with the text "WebSiteName" in bold.
             Navigation Menu: To the right of the logo, a horizontal navigation menu includes links labeled "Home," "About Us," "Services," "Blog," and "Contact." Each link is styled with a sans-serif font, medium size, and turns bold with an underline on hover.
             Search Bar: Located at the top-right corner, the search bar has a placeholder text "Search..." and a magnifying glass icon.
             Main Content Area:

             Hero Section: Spanning the top of the main content, a large banner image of a cityscape with an overlaying text "Welcome to Our Website" in white, bold, and a larger font size. Below this, a smaller subtitle reads "Your source for the latest updates" in italic.
             Article Section: Below the hero section, a two-column layout displays the latest articles. Each column features a thumbnail image on the left, with an article title in bold, a snippet of text, and a "Read More" link in blue on the right.
             Embedded Video: Further down, an embedded YouTube video player showcases a featured video with a play button overlay.
             Sidebar:
             
             Ads: The top of the sidebar features a rectangular ad banner with animated content promoting a sale on electronics.
             Popular Posts: Below the ad, a list of links to popular blog posts with thumbnail images and brief descriptions.
             Footer:
             
             Social Media Links: Icons for Facebook, Twitter, Instagram, and LinkedIn are positioned on the left, each in their respective brand colors.
             Additional Links: On the right, smaller text links include "Privacy Policy," "Terms of Service," and "Sitemap."
             Copyright Information: Centered at the bottom, a text reads "© 2024 WebSiteName. All rights reserved."
             Interactive Elements:
             
             Buttons: The "Contact" button in the navigation menu is highlighted with a green background and white text. On hover, the background color changes to a darker green.
             Form Elements: A newsletter signup form in the footer includes text fields for "Name" and "Email," and a "Subscribe" button in blue.
             Colors and Themes:
             
             Primary Colors: The website uses a palette of blue, white, and grey. The background color is a light grey, with content areas in white and text in dark grey.
             Font Styles: The primary font is a modern sans-serif, with headers in bold and body text in regular weight.
             Additional Details:
             
             Pop-up Notification: A small pop-up at the bottom-right corner offers a discount code for new subscribers, with a close button in the top-right corner of the pop-up.
             The webpage screenshot displays a well-organized layout with a prominent header, main content area, sidebar, and footer.

             Header:
             
             Logo: Positioned at the top-left corner, featuring a blue and white logo with the text "WebSiteName" in bold.
             Navigation Menu: To the right of the logo, a horizontal navigation menu includes links labeled "Home," "About Us," "Services," "Blog," and "Contact." Each link is styled with a sans-serif font, medium size, and turns bold with an underline on hover.
             Search Bar: Located at the top-right corner, the search bar has a placeholder text "Search..." and a magnifying glass icon.
             Main Content Area:
             
             Hero Section: Spanning the top of the main content, a large banner image of a cityscape with an overlaying text "Welcome to Our Website" in white, bold, and a larger font size. Below this, a smaller subtitle reads "Your source for the latest updates" in italic.
             Article Section: Below the hero section, a two-column layout displays the latest articles. Each column features a thumbnail image on the left, with an article title in bold, a snippet of text, and a "Read More" link in blue on the right.
             Embedded Video: Further down, an embedded YouTube video player showcases a featured video with a play button overlay.
             Sidebar:
             
             Ads: The top of the sidebar features a rectangular ad banner with animated content promoting a sale on electronics.
             Popular Posts: Below the ad, a list of links to popular blog posts with thumbnail images and brief descriptions.
             Footer:
             
             Social Media Links: Icons for Facebook, Twitter, Instagram, and LinkedIn are positioned on the left, each in their respective brand colors.
             Additional Links: On the right, smaller text links include "Privacy Policy," "Terms of Service," and "Sitemap."
             Copyright Information: Centered at the bottom, a text reads "© 2024 WebSiteName. All rights reserved."
             Interactive Elements:
             
             Buttons: The "Contact" button in the navigation menu is highlighted with a green background and white text. On hover, the background color changes to a darker green.
             Form Elements: A newsletter signup form in the footer includes text fields for "Name" and "Email," and a "Subscribe" button in blue.
             Colors and Themes:
             
             Primary Colors: The website uses a palette of blue, white, and grey. The background color is a light grey, with content areas in white and text in dark grey.
             Font Styles: The primary font is a modern sans-serif, with headers in bold and body text in regular weight.
             Additional Details:

             Pop-up Notification: A small pop-up at the bottom-right corner offers a discount code for new subscribers, with a close button in the top-right corner of the pop-up.`
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
        {
          text: `
          Create Angular code using Angular Material (material.angular.io) to build a responsive user interface that includes the following components:

Header:

A top navigation bar with the website logo on the left and navigation links ("Home," "About Us," "Services," "Contact") on the right.
Use the Angular Material mat-toolbar and mat-icon components.
Sidebar:

A collapsible sidebar that includes a user profile section at the top with a user avatar, name, and email.
Below the profile section, include a list of links ("Dashboard," "Settings," "Help") using the Angular Material mat-sidenav and mat-list components.
Main Content:

A main content area displaying a grid of cards, each representing a service offered by the company. Each card should include an image, a title, a short description, and a button to read more.
Use the Angular Material mat-grid-list and mat-card components.
Footer:

A footer with social media icons (Facebook, Twitter, LinkedIn) on the left and additional links ("Privacy Policy," "Terms of Service") on the right.
Use the Angular Material mat-icon and mat-toolbar components for the footer.
Description:

The provided Angular code should create a responsive layout with a clean and modern look. The top navigation bar will use the mat-toolbar component to display the logo and navigation links. The sidebar will be implemented using the mat-sidenav component and will include user profile information and additional navigation links. The main content area will use a grid layout (mat-grid-list) to display service cards, each created with the mat-card component. The footer will use mat-toolbar and mat-icon components to display social media icons and additional links.

// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatGridListModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

// app.component.html
<mat-toolbar color="primary">
  <span class="logo">WebSiteName</span>
  <span class="spacer"></span>
  <a mat-button routerLink="/home">Home</a>
  <a mat-button routerLink="/about">About Us</a>
  <a mat-button routerLink="/services">Services</a>
  <a mat-button routerLink="/contact">Contact</a>
</mat-toolbar>

<mat-sidenav-container>
  <mat-sidenav mode="side" opened>
    <mat-list>
      <mat-list-item>
        <mat-icon matListIcon>account_circle</mat-icon>
        <div matLine>User Name</div>
        <div matLine>user@example.com</div>
      </mat-list-item>
      <mat-divider></mat-divider>
      <a mat-list-item routerLink="/dashboard">Dashboard</a>
      <a mat-list-item routerLink="/settings">Settings</a>
      <a mat-list-item routerLink="/help">Help</a>
    </mat-list>
  </mat-sidenav>

  <mat-sidenav-content>
    <mat-grid-list cols="3" rowHeight="350px">
      <mat-grid-tile *ngFor="let service of services">
        <mat-card>
          <img mat-card-image [src]="service.image" alt="{{ service.title }}">
          <mat-card-title>{{ service.title }}</mat-card-title>
          <mat-card-content>{{ service.description }}</mat-card-content>
          <mat-card-actions>
            <button mat-button>Read More</button>
          </mat-card-actions>
        </mat-card>
      </mat-grid-tile>
    </mat-grid-list>
  </mat-sidenav-content>
</mat-sidenav-container>

<mat-toolbar color="primary" class="footer">
  <span class="social-media-icons">
    <mat-icon>facebook</mat-icon>
    <mat-icon>twitter</mat-icon>
    <mat-icon>linkedin</mat-icon>
  </span>
  <span class="spacer"></span>
  <a mat-button routerLink="/privacy">Privacy Policy</a>
  <a mat-button routerLink="/terms">Terms of Service</a>
</mat-toolbar>

// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  services = [
    { image: 'service1.jpg', title: 'Service 1', description: 'Description of Service 1' },
    { image: 'service2.jpg', title: 'Service 2', description: 'Description of Service 2' },
    { image: 'service3.jpg', title: 'Service 3', description: 'Description of Service 3' },
    // Add more services as needed
  ];
}

          `
        },
        {
          text: 'Create a simple angular functional page with using Material Angular:' + this.imageDescription +
            "Constraints: "+
            materialImports +
            "Focus on achieving the core functionality with minimal code, make sure all the files work and compile" +
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
    // Split the files into pairs of two: name and content
    for (let i = 0; i < files.length; i += 2) {
      newTask += files[i] + files[i + 1] + '\n';
      this.formatedFiles.push(newTask);
      newTask = '';
    }

    this.formatedFiles = this.formatedFiles.slice(0, this.formatedFiles.length - 1);
  }
}
