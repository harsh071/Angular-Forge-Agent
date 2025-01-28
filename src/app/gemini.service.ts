import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, GenerativeModel } from '@google/generative-ai';

import { FileConversionService } from './file-conversion.service';

import { environment } from '../environments/environment';
import { materialImports } from './material-imports';
import { getPrompt } from './prompt';
import { FirestoreService } from './firestore-service.service';

interface GeneratedFile {
  filename: string;
  content: string;
}

interface WebpageDescription {
  description: string;
  code: string[];
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly MODEL_NAME = 'gemini-1.5-pro-001';
  private readonly MAX_RETRIES = 3;
  
  public imageDescription$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public formatedFiles: string[] = [];
  private model: GenerativeModel;
  private genAI: GoogleGenerativeAI;

  constructor(
    private readonly http: HttpClient,
    private readonly fileConversionService: FileConversionService,
    private readonly firestoreService: FirestoreService
  ) {
    this.genAI = new GoogleGenerativeAI(environment.firebase.apiKey);
    this.model = this.initializeModel();
  }

  private initializeModel(): GenerativeModel {
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
      maxOutputTokens: 8192,
      temperature: 0.9,
      topP: 0.95,
    };

    return this.genAI.getGenerativeModel({
      model: this.MODEL_NAME,
      ...generationConfig,
    });
  }

  public async initGemini(file?: string): Promise<void> {
    try {
      const imageBase64 = await this.fileConversionService.convertToBase64('assets/goog.png');
      
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        throw new Error('Image conversion to Base64 failed');
      }

      const imageDescription = await this.generateImageDescription(file || imageBase64);
      const generatedCode = await this.generateAngularCode(imageDescription);
      
      await this.saveToFirestore(imageDescription, generatedCode);
    } catch (error) {
      console.error('Error in initGemini:', error);
      throw error;
    }
  }

  private async generateImageDescription(imageData: string): Promise<string> {
    const prompt = [
      {
        inlineData: {
          mimeType: 'image/png',
          data: imageData,
        },
      },
      {
        text: `Analyze and describe the webpage shown in the image with the following structure:

1. Layout Overview:
   - Header elements
   - Main content structure
   - Navigation components
   - Sidebar presence
   - Footer layout

2. Visual Elements:
   - Color scheme
   - Typography
   - Images and media
   - Spacing and alignment

3. Interactive Components:
   - Buttons and CTAs
   - Forms and inputs
   - Navigation menus
   - Dynamic elements

4. Content Organization:
   - Information hierarchy
   - Content sections
   - Data presentation

Please provide a structured JSON response in the following format:
{
  "layout": {
    "header": { ... },
    "mainContent": { ... },
    "sidebar": { ... },
    "footer": { ... }
  },
  "visualElements": { ... },
  "interactiveComponents": { ... },
  "contentStructure": { ... }
}`
      },
    ];

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const description = response.text();
    
    this.imageDescription$.next(description);
    return description;
  }

  private async generateAngularCode(description: string): Promise<GeneratedFile[]> {
    const prompt = [{
      text: `Create an Angular Material implementation based on this description: ${description}

Requirements:
1. Use Angular Material components
2. Implement responsive design
3. Follow Angular best practices
4. Include proper TypeScript typing
5. Use Material theming

The response MUST be a valid JSON array exactly matching this structure (including proper escaping):
[
  {
    "filename": "app.component.ts",
    "content": "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-root',\n  templateUrl: './app.component.html',\n  styleUrls: ['./app.component.scss']\n})\nexport class AppComponent {\n  // Your component logic here\n}"
  },
  {
    "filename": "app.component.html",
    "content": "<mat-toolbar color=\\"primary\\">\n  <!-- Your template here -->\n</mat-toolbar>"
  },
  {
    "filename": "app.component.scss",
    "content": "/* Your styles here */\n\n.container {\n  // Your SCSS styles\n}"
  }
]

Important formatting rules:
1. All strings must use escaped double quotes (\\"example\\")
2. Use proper line breaks with \\n
3. The entire response must be valid JSON that can be parsed with JSON.parse()
4. Include all necessary Angular Material imports and components
5. Ensure proper component structure with TypeScript decorators
6. Include responsive SCSS styles
7. Follow the exact structure of the example above

Available Material imports:
${materialImports}`
    }];

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Validate JSON structure
      let parsedResponse: GeneratedFile[];
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse LLM response as JSON:', error);
        throw new Error('Generated code is not in valid JSON format');
      }

      // Validate response structure
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Generated code must be an array');
      }

      const requiredFiles = ['app.component.ts', 'app.component.html', 'app.component.scss'];
      const missingFiles = requiredFiles.filter(
        file => !parsedResponse.some(item => item.filename === file)
      );

      if (missingFiles.length > 0) {
        throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
      }

      // Validate each file has required properties
      parsedResponse.forEach(file => {
        if (!file.filename || !file.content || typeof file.content !== 'string') {
          throw new Error(`Invalid file structure for ${file.filename}`);
        }
      });

      return parsedResponse;
    } catch (error) {
      console.error('Error generating Angular code:', error);
      throw error;
    }
  }

  private async saveToFirestore(description: string, files: GeneratedFile[]): Promise<void> {
    const formattedFiles = files.map(file => file.content);
    const randomId = Math.floor(Math.random() * 1000).toString();
    
    const data: WebpageDescription = {
      description,
      code: formattedFiles,
    };

    await this.firestoreService.addData('items', 'description-code', { 
      [randomId]: data 
    });
  }
}
