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
        await this.firestoreService.saveData('items', 'description-code', {
          description: prompt,
          code: parsedFiles
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