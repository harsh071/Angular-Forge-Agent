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

interface CodeEvaluation {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
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

  // Add property for rendered template
  private renderedTemplateSubject = new BehaviorSubject<string>('');
  renderedTemplate$ = this.renderedTemplateSubject.asObservable();

  constructor(private firestoreService: FirestoreService) {
    // Replace with your actual API key
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
  }]

Important formatting rules:
1. All strings must use escaped double quotes (\\"example\\")
2. Use proper line breaks with \\n
3. The entire response must be valid JSON that can be parsed with JSON.parse()
4. Include realistic mock data (names, dates, descriptions)
5. Use proper Angular Material components and directives
6. Include proper Angular template syntax (ngFor, ngIf, etc.)
7. Follow the exact structure of the example above
`;

  private readonly CODE_EVALUATION_PROMPT = `You are an expert Angular code reviewer. Evaluate the following code for best practices, potential issues, and improvements.
  Focus on:
  1. Angular best practices
  2. TypeScript type safety
  3. Performance considerations
  4. Responsive design
  5. Material design implementation
  6. Component structure
  7. Error handling

  Return the evaluation in this exact JSON format:
  {
    "isValid": boolean,
    "issues": string[],
    "suggestions": string[]
  }`;

  private readonly CODE_FIX_PROMPT = `You are an expert Angular developer. Fix the following code based on the provided evaluation.
  Ensure the fixed code:
  1. Follows all Angular best practices
  2. Uses proper TypeScript types
  3. Implements proper error handling
  4. Uses Angular Material components correctly
  5. Implements responsive design
  6. Follows the same JSON structure as the original

  Return only the fixed code in the same JSON array format as the original.`;

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

      try {
        const cleanedText = this.cleanGeneratedCode(text);
        console.log('Cleaned text:', cleanedText);
        
        const parsedFiles = this.parseGeneratedFiles(cleanedText);
        console.log('Parsed files:', parsedFiles);
        
        if (parsedFiles && parsedFiles.length > 0) {
          // Evaluate and fix the code
          const evaluation = await this.evaluateCode(parsedFiles);
          console.log('Code evaluation:', evaluation);

          let finalFiles = parsedFiles;
          if (!evaluation.isValid) {
            console.log('Code needs fixes. Applying improvements...');
            finalFiles = await this.fixCode(parsedFiles, evaluation);
          }

          // Generate the rendered template
          console.log('Generating rendered template...');
          const renderedTemplate = await this.renderTemplate(finalFiles);
          
          // Create a new file for the rendered template
          const renderedFile: GeneratedFile = {
            filename: 'rendered-template.html',
            content: renderedTemplate
          };
          
          // Update the rendered template subject
          this.renderedTemplateSubject.next(renderedTemplate);
          
          // Add the rendered file to finalFiles
          finalFiles = [...finalFiles, renderedFile];
          
          this.formatedFiles = [JSON.stringify(finalFiles, null, 2)];

          await this.saveToFirestore(
            isTextPrompt ? input : text,
            finalFiles
          );
          console.log('Successfully processed and saved files:', finalFiles);
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
      // Remove any markdown code block indicators and clean the text
      text = text.replace(/```(json)?\n/g, '');
      text = text.replace(/```\n?/g, '');
      text = text.trim();

      // Remove any control characters that could corrupt the JSON
      text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

      // First try to parse the entire text as JSON
      try {
        const directParse = JSON.parse(text);
        
        // Handle case where files are nested under a "files" key
        if (directParse.files && Array.isArray(directParse.files)) {
          if (directParse.files.length > 0 && 'filename' in directParse.files[0]) {
            return directParse.files;
          }
        }
        
        // Handle case where it's a direct array of files
        if (Array.isArray(directParse) && directParse.length > 0 && 'filename' in directParse[0]) {
          return directParse;
        }
      } catch (e) {
        // If direct parse fails, continue with substring extraction
      }

      // Find the JSON array in the text and clean it
      const matches = text.match(/\{\s*"files"\s*:\s*\[\s*\{[\s\S]*\}\s*\]\s*\}|\[\s*\{\s*"filename"[\s\S]*\}\s*\]/g);
      if (matches && matches.length > 0) {
        let jsonStr = matches[0];
        // Additional cleaning of the extracted JSON string
        jsonStr = jsonStr.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        
        const parsed = JSON.parse(jsonStr);
        
        // Handle nested files structure
        if (parsed.files && Array.isArray(parsed.files)) {
          return parsed.files;
        }
        
        // Handle direct array structure
        if (Array.isArray(parsed)) {
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

  private async evaluateCode(files: GeneratedFile[]): Promise<CodeEvaluation> {
    try {
      const result = await this.model.generateContent([
        this.CODE_EVALUATION_PROMPT,
        JSON.stringify(files, null, 2)
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      try {
        const evaluation = JSON.parse(text);
        return {
          isValid: evaluation.isValid || false,
          issues: evaluation.issues || [],
          suggestions: evaluation.suggestions || []
        };
      } catch (e) {
        console.error('Error parsing evaluation:', e);
        return {
          isValid: false,
          issues: ['Failed to parse evaluation response'],
          suggestions: []
        };
      }
    } catch (error) {
      console.error('Error evaluating code:', error);
      return {
        isValid: false,
        issues: ['Error during code evaluation'],
        suggestions: []
      };
    }
  }

  private async fixCode(files: GeneratedFile[], evaluation: CodeEvaluation): Promise<GeneratedFile[]> {
    try {
      const result = await this.model.generateContent([
        this.CODE_FIX_PROMPT,
        JSON.stringify({ files, evaluation }, null, 2)
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      const parsedFiles = this.parseGeneratedFiles(text);
      if (!parsedFiles) {
        throw new Error('Failed to parse fixed code');
      }
      
      return parsedFiles;
    } catch (error) {
      console.error('Error fixing code:', error);
      return files; // Return original files if fix fails
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
}
