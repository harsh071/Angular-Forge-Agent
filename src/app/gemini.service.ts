import { Injectable } from '@angular/core';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeModel,
  EnhancedGenerateContentResponse,
} from '@google/generative-ai';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { FirestoreService } from './firestore-service.service';

// Add interfaces
interface GeneratedFile {
  filename: string;
  content: string;
}

interface WebpageDescription {
  description: string;
  code: GeneratedFile[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private visionModel: GenerativeModel;
  
  // Add BehaviorSubject for image description
  private imageDescriptionSubject = new BehaviorSubject<string>('');
  imageDescription$ = this.imageDescriptionSubject.asObservable();
  
  // Add property for formatted files
  formatedFiles: string[] = [];

  constructor(private firestoreService: FirestoreService) {
    // Replace with your actual API key
    this.genAI = new GoogleGenerativeAI(environment.firebase.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  private readonly ANGULAR_CODE_PROMPT = `You are an expert Angular developer. Generate clean, modern, and well-structured Angular code based on the following requirements. 
  Include all necessary imports and ensure the code follows Angular best practices. Format the response as valid TypeScript/HTML/SCSS code only, without any explanations or markdown.
  Return the code as an array of objects with 'filename' and 'content' properties in JSON format. Example:
  [{
    "filename": "component.ts",
    "content": "// TypeScript code here"
  },
  {
    "filename": "component.html",
    "content": "<!-- HTML code here -->"
  }]`;

  async initGemini(input: string, isTextPrompt: boolean = false): Promise<void> {
    try {
      let result;
      if (isTextPrompt) {
        result = await this.model.generateContent(this.ANGULAR_CODE_PROMPT + '\n' + input);
      } else {
        const imageData = {
          inlineData: {
            data: input,
            mimeType: 'image/jpeg'
          }
        };
        
        result = await this.visionModel.generateContent([
          this.ANGULAR_CODE_PROMPT,
          imageData
        ]);
      }

      const response = await result.response;
      const text = response.text();
      
      if (!isTextPrompt) {
        this.imageDescriptionSubject.next(text);
      }

      // Parse the generated code and save to Firestore
      try {
        const cleanedText = this.cleanGeneratedCode(text);
        console.log('Cleaned text:', cleanedText);
        
        const parsedFiles = this.parseGeneratedFiles(cleanedText);
        console.log('Parsed files:', parsedFiles);
        
        if (parsedFiles && parsedFiles.length > 0) {
          this.formatedFiles = [JSON.stringify(parsedFiles, null, 2)];
          await this.saveToFirestore(
            isTextPrompt ? input : text,
            parsedFiles
          );
          console.log('Successfully processed and saved files:', parsedFiles);
        } else {
          console.error('Failed to parse generated files. Response format may be incorrect:', cleanedText);
          throw new Error('Failed to parse generated files');
        }
      } catch (error) {
        console.error('Error processing generated files:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in initGemini:', error);
      throw error;
    }
  }

  private parseGeneratedFiles(text: string): GeneratedFile[] | null {
    try {
      // First try to parse the entire text as JSON
      try {
        const directParse = JSON.parse(text);
        if (Array.isArray(directParse) && directParse.length > 0 && 'filename' in directParse[0]) {
          return directParse;
        }
      } catch (e) {
        // If direct parse fails, continue with substring extraction
      }

      // Find the JSON array in the text
      const matches = text.match(/\[\s*\{\s*"filename"[\s\S]*\}\s*\]/g);
      if (matches && matches.length > 0) {
        const jsonStr = matches[0];
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // If no valid JSON array found, return null
      return null;
    } catch (error) {
      console.error('Error parsing generated files:', error);
      console.error('Text being parsed:', text);
      return null;
    }
  }

  private async generateContent(prompt: string): Promise<string> {
    const result = await this.model.generateContent(this.ANGULAR_CODE_PROMPT + '\n' + prompt);
    const response = await result.response;
    return response.text();
  }

  private async generateContentFromImage(
    image: File,
    prompt: string
  ): Promise<string> {
    const imageData = await this.fileToGenerativePart(image);
    const result = await this.visionModel.generateContent([
      this.ANGULAR_CODE_PROMPT + '\n' + prompt,
      imageData,
    ]);
    const response = await result.response;
    return response.text();
  }

  private async fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64Encoded = reader.result.split(',')[1];
          resolve(base64Encoded);
        }
      };
      reader.readAsDataURL(file);
    });

    const base64EncodedData = await base64EncodedDataPromise;
    return {
      inlineData: {
        data: base64EncodedData,
        mimeType: file.type,
      },
    };
  }

  generateAngularCode(prompt: string): Observable<string> {
    return from(this.generateContent(prompt));
  }

  generateAngularCodeFromImage(
    image: File,
    prompt: string
  ): Observable<string> {
    return from(this.generateContentFromImage(image, prompt));
  }

  // Helper method to validate and clean generated code
  private cleanGeneratedCode(code: string): string {
    // Remove any markdown code block indicators
    code = code.replace(/```(typescript|html|scss|css)?\n/g, '');
    code = code.replace(/```\n?/g, '');
    // Remove any leading/trailing whitespace
    code = code.trim();
    return code;
  }

  private async saveToFirestore(description: string, files: GeneratedFile[]): Promise<void> {
    try {
      const randomId = Math.floor(Math.random() * 1000000).toString(); // Increased range for better uniqueness
      
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
        data
      });
    } catch (error: any) {
      console.error('Error saving to Firestore:', error);
      throw new Error(`Failed to save to Firestore: ${error?.message || 'Unknown error'}`);
    }
  }
}
