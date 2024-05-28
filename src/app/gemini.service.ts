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
      temperature: 0.9,
      top_p: 1,
      top_k: 32,
      maxOutputTokens: 100, // limit output
    };

    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-pro-vision', // or 'gemini-pro-vision'
      ...this.generationConfig,
    });
  }

  public async initGemini(file?: string,) {
    
    try {
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
            'Be as descriptive as possible and include all the necessary details for gemini.',
        },
      ];

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      this.imageDescription = response.text();

      const model2 = this.genAI.getGenerativeModel({
        model: 'gemini-pro', // or 'gemini-pro-vision'
        ...this.generationConfig,
      });

      prompt = [
        {
          text: 'Create a simple angular functional page with using Material Angular:' + this.imageDescription +
            + "Libraries:\
           Material Angular from material.angular.io." +
            "Constraints:\
          Do not include any unnecessary dependencies, must include Material Angular and all variables used in html implemented in typescript" +
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
