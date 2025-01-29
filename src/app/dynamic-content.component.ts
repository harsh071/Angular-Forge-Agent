import { Component, Input, OnInit, ViewChild, ViewContainerRef, Compiler, Injector, NgModule, NgModuleRef, CUSTOM_ELEMENTS_SCHEMA, EnvironmentInjector, ComponentRef, Inject, ComponentFactory, createNgModule, createComponent } from '@angular/core';
import { CommonModule } from '@angular/common';

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
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
// Material Popups & Modals
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
// Material Data tables
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';

// interface Video { title: string; description: string; date: Date; views: number; thumbnail: string; channel: { name: string; imageUrl: string }; }


@Component({
  selector: 'app-dynamic-content',
  standalone: true,
  template: `<ng-container #dynamicContentContainer></ng-container>`
})
export class DynamicContentComponent implements OnInit {
  @Input() dynamicTs: string;
  @Input() dynamicHtml: string;
  @Input() dynamicCss: string;

  @ViewChild('dynamicContentContainer', { read: ViewContainerRef, static: true }) dynamicContentContainer: ViewContainerRef;

  constructor(private viewContainerRef: ViewContainerRef, 
    private envInjector: EnvironmentInjector,
    private compiler: Compiler,
    private injector: Injector,
    private moduleRef: NgModuleRef<any>,
  ) {}

  ngOnInit(): void {
    this.renderDynamicContent();
  }

  async renderDynamicContent() {
    const template = `<div>${this.dynamicHtml}</div>`;
    const styles = `:host {
      ${this.dynamicCss}
    }`
    
    // Extract the TypeScript code without imports
    const dynamicTs = this.dynamicTs; // Capture in closure
    let processedTs = '';
    
    try {
      // Remove import statements and convert types to any


      // Extract the class content
      const classMatch = processedTs.match(/export\s+class\s+\w+\s*{([\s\S]*?)}/);
      if (classMatch) {
        // Get the class body content, preserving all formatting
        const classContent = classMatch[1];
        // Create a function that returns an object with the class content
        processedTs = `
          return {
            ${classContent}
          };
        `;
        console.log('Processed TypeScript:', processedTs);
      }
    } catch (error) {
      console.error('Error processing TypeScript:', error);
    }

    const componentDef = {
      template,
      styles: [styles],
      imports: [
        CommonModule, 
        MatToolbarModule, 
        MatButtonModule, 
        MatGridListModule, 
        MatCardModule,
        MatNativeDateModule,
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
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      standalone: true
    };

    const DynamicComponent = class {
      constructor() {
        try {
          if (processedTs) {
            const dynamicCode = new Function(processedTs);
            Object.assign(this, dynamicCode());
          }
        } catch (error) {
          console.error('Error evaluating dynamic TypeScript:', error);
        }
      }
    };

    const decoratedComponent = Component(componentDef)(DynamicComponent);
    const moduleRef = createNgModule(decoratedComponent, this.envInjector);
    const componentRef = createComponent(decoratedComponent, { environmentInjector: this.envInjector });
    this.dynamicContentContainer.clear();
    this.dynamicContentContainer.insert(componentRef.hostView);
  }
}
