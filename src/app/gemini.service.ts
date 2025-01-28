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
  code: GeneratedFile[];
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
        text: `Analyze the webpage shown in the image and provide an EXACT, pixel-perfect description that would allow recreating it identically. Focus on precise details:

1. Exact Layout Measurements:
   - Precise pixel dimensions for all elements
   - Exact positioning and coordinates
   - Specific margins, padding, and spacing values
   - Grid/flex specifications with exact values
   - Responsive breakpoints if visible

2. Detailed Visual Specifications:
   - Exact hex color codes for all elements
   - Complete typography details (font family, size, weight, line height)
   - Border specifications (width, style, color)
   - Shadow effects (offset, blur, spread, color)
   - Opacity and overlay values
   - Image dimensions and aspect ratios

3. Component-Specific Details:
   - Button dimensions and states (hover, active, disabled)
   - Input field specifications
   - Icon sizes and styles
   - List item spacing and styling
   - Card/container border-radius and effects
   - Navigation item styling and spacing

4. Content and Text:
   - Exact text content
   - Text alignment and transformation
   - Link styling and states
   - List style specifications
   - Content padding and margins

5. Interactive Elements:
   - Hover state colors and transitions
   - Animation specifications (timing, easing)
   - Form element styling
   - Dropdown/menu specifications
   - Modal/dialog styling if present

Please provide a structured JSON response that captures EVERY visual detail in this format:
{
  "layout": {
    "header": {
      "height": "exact_px",
      "padding": "exact_values",
      "elements": [
        {
          "type": "element_type",
          "dimensions": {"width": "px", "height": "px"},
          "position": {"top": "px", "left": "px"},
          "styling": {
            "backgroundColor": "#exact_hex",
            "fontSize": "px",
            "fontFamily": "exact_font",
            "margin": "exact_values",
            "padding": "exact_values"
          }
        }
      ]
    },
    "mainContent": { similar_detailed_structure },
    "sidebar": { similar_detailed_structure },
    "footer": { similar_detailed_structure }
  },
  "visualElements": {
    "colorPalette": {
      "primary": "#exact_hex",
      "secondary": "#exact_hex",
      "background": "#exact_hex",
      "text": "#exact_hex"
    },
    "typography": {
      "headings": {
        "h1": {"size": "px", "weight": "value", "lineHeight": "value", "font": "exact_font"},
        "h2": {similar_structure}
      },
      "body": {similar_structure}
    }
  },
  "interactiveComponents": {
    "buttons": {
      "primary": {
        "default": {detailed_styles},
        "hover": {detailed_styles},
        "active": {detailed_styles}
      }
    },
    "inputs": {detailed_styles},
    "dropdowns": {detailed_styles}
  }
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
    try {
      const randomId = Math.floor(Math.random() * 1000).toString();
      
      const data: WebpageDescription = {
        description,
        code: files,
      };

      await this.firestoreService.addData('items', 'description-code', { 
        [randomId]: data 
      });

      console.log('Successfully saved to Firestore:', {
        collectionId: 'items',
        documentId: 'description-code',
        data: data
      });
    } catch (error: any) {
      console.error('Error saving to Firestore:', error);
      throw new Error(`Failed to save to Firestore: ${error?.message || 'Unknown error'}`);
    }
  }
}
