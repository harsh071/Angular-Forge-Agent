import { Injectable } from '@angular/core';
import {
  GoogleGenerativeAI,
  GenerativeModel,
} from '@google/generative-ai';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FirestoreService } from '../firestore-service.service';

export interface GeneratedFile {
  filename: string;
  content: string;
}

interface WebpageDescription {
  description: string;
  code: GeneratedFile[];
}

interface CodeEvaluation {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CodeGenerationService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private visionModel: GenerativeModel;
  
  private generatedFilesSubject = new BehaviorSubject<GeneratedFile[]>([]);
  generatedFiles$ = this.generatedFilesSubject.asObservable();
  
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  private renderedTemplateSubject = new BehaviorSubject<string>('');
  renderedTemplate$ = this.renderedTemplateSubject.asObservable();

  constructor(private firestoreService: FirestoreService) {
    this.genAI = new GoogleGenerativeAI(environment.firebase.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-8b',
      generationConfig: {
        maxOutputTokens: 8192
      }
    });
    this.visionModel = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-8b',
      generationConfig: {
        maxOutputTokens: 8192
      }
    });
  }

  async generateFromText(prompt: string): Promise<void> {
    try {
      this.isLoadingSubject.next(true);
      this.errorSubject.next(null);
      
      const result = await this.model.generateContent(this.ANGULAR_CODE_PROMPT + '\n' + prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = this.cleanGeneratedCode(text);
      const parsedFiles = this.parseGeneratedFiles(cleanedText);
      
      if (parsedFiles && parsedFiles.length > 0) {
        this.generatedFilesSubject.next(parsedFiles);

        const randomId = Math.floor(Math.random() * 1000000).toString(); // Increased range for better uniqueness
        const renderedTemplate = await this.renderTemplate(parsedFiles);

        const renderedFile: GeneratedFile = {
          filename: 'rendered-template.html',
          content: renderedTemplate
        };
        
        // Update the rendered template subject
        this.renderedTemplateSubject.next(renderedTemplate);
        let newparsedFiles = [...parsedFiles, renderedFile];

        const data: WebpageDescription = {
          description: prompt,
          code: newparsedFiles,
        };
  
        await this.firestoreService.saveData('items', 'description-code', { 
          [randomId]: data 
        });
  
      } else {
        throw new Error('Failed to parse generated files');
      }
    } catch (error) {
      this.errorSubject.next(error as string);
      console.error('Error generating from text:', error);
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  async generateFromImage(base64Image: string): Promise<void> {
    try {
      this.isLoadingSubject.next(true);
      this.errorSubject.next(null);
      
      const imageData = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      };
      
      const result = await this.visionModel.generateContent([
        this.ANGULAR_CODE_PROMPT,
        imageData
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = this.cleanGeneratedCode(text);
      const parsedFiles = this.parseGeneratedFiles(cleanedText);
      
      if (parsedFiles && parsedFiles.length > 0) {
        this.generatedFilesSubject.next(parsedFiles);
        await this.firestoreService.saveData('items', 'description-code', {
          description: text,
          code: parsedFiles
        });
      } else {
        throw new Error('Failed to parse generated files');
      }
    } catch (error) {
      this.errorSubject.next(error as string);
      console.error('Error generating from image:', error);
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  private cleanGeneratedCode(code: string): string {
    return code
      .replace(/```(json)?\n/g, '')
      .replace(/```\n?/g, '')
      .trim()
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  }

  private parseGeneratedFiles(text: string): GeneratedFile[] | null {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Error parsing generated files:', error);
      return null;
    }
  }

  private async renderTemplate(files: GeneratedFile[]): Promise<string> {
    try {
      // Find the TypeScript and HTML files
      const tsFile = files.find(f => f.filename.endsWith('.ts'));
      const htmlFile = files.find(f => f.filename.endsWith('.html'));

      if (!tsFile || !htmlFile) {
        throw new Error('Missing required TypeScript or HTML files');
      }

      const result = await this.model.generateContent([
        this.TEMPLATE_RENDER_PROMPT,
        `TypeScript File:\n${tsFile.content}\n\nHTML Template:\n${htmlFile.content}`
      ]);
      
      const response = await result.response;
      const fullHtml = response.text();
      
      // Extract only the body content
      const bodyContent = this.extractBodyContent(fullHtml);
      
      if (!bodyContent) {
        throw new Error('Failed to extract valid HTML content from template');
      }
      
      return bodyContent;
    } catch (error) {
      console.error('Error rendering template:', error);
      throw error;
    }
  }

  private extractBodyContent(html: string): string {
    try {
      // First try to match content between body tags
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (bodyMatch && bodyMatch[1]) {
        return bodyMatch[1].trim();
      }
      
      // If no body tags found, return the entire content
      // but first check if it starts with any HTML/Material components
      if (html.trim().startsWith('<mat-') || html.trim().startsWith('<div') || html.trim().startsWith('<app-')) {
        return html.trim();
      }
      
      console.warn('No valid HTML content found in template');
      return '';
    } catch (error) {
      console.error('Error extracting body content:', error);
      return '';
    }
  }

  private readonly TEMPLATE_RENDER_PROMPT = `You are an expert Angular developer. Convert the provided TypeScript component code into a fully rendered HTML template with all mock data directly embedded.

  Requirements:
  1. Remove all Angular template syntax (ngFor, ngIf, etc.)
  2. Replace all dynamic bindings with actual values from the TypeScript code
  3. Keep all Material Design components and styling
  4. Maintain the same visual structure and layout
  5. Include all mock data directly in the HTML
  6. Remove any data bindings and replace with static content
  7. Keep all styling classes and Material Design attributes
  8. Wrap the entire content in <body> tags
  9. Do not include <html>, <head>, or any other tags outside the <body> tags

  The output should be a single HTML file with content wrapped in <body> tags that can be directly viewed in a browser without typescript, for example:
  <body>
    <mat-toolbar color="primary">...</mat-toolbar>
    ...content...
  </body>`;

  private readonly ANGULAR_CODE_PROMPT = `You are an expert Angular developer. Generate a realistic HTML template with mock data for an Angular application. 
  The HTML should include realistic content, sample data, and proper Material Design components.

  Requirements:
1. Use Angular Material components
2. Include realistic mock data (user names, descriptions, dates, etc.)
3. Create a complete page layout
4. Use Material icons where appropriate
5. Include proper Angular template syntax
6. DO NOT ADD ANY IMPORT STATEMENTS
7. DO NOT ADD ANY COMPONENT DECORATORS
8. ADD ONLY THE CLASS CODE in the ts file.
9. ALL TYPES HAVE TO BE any or any[]

Output in this format:
The response MUST be a valid JSON array exactly matching this structure (including proper escaping):
[{
    "filename": "app.component.ts",
    "content": "{\n  // Your component logic here\n}" //DO NOT ADD ANY IMPORT STATEMENTS, or class decorators
  },
  {
    "filename": "app.component.html",
    "content": "code here"
  },
  {
    "filename": "app.component.scss",
    "content": "/* Your styles here */\n\n.container {\n  // Your SCSS styles\n}"
  }]`;
}