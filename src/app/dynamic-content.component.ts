import { Component, Input, OnInit, ViewChild, ViewContainerRef, Compiler, Injector, NgModule, NgModuleRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dynamic-content',
  standalone: true,
  template: `<ng-container #dynamicContentContainer></ng-container>`
})
export class DynamicContentComponent implements OnInit {
  @Input() dynamicHtml: string;

  @ViewChild('dynamicContentContainer', { read: ViewContainerRef, static: true }) dynamicContentContainer: ViewContainerRef;

  constructor(
    private compiler: Compiler,
    private injector: Injector,
    private moduleRef: NgModuleRef<any>
  ) {}

  ngOnInit(): void {
    this.renderDynamicContent();
  }

  async renderDynamicContent() {
    const template = `<div>${this.dynamicHtml}</div>`;

    const tmpCmp = Component({ template: template })(class {});
    const tmpModule = NgModule({
      declarations: [tmpCmp],
      imports: [CommonModule, MatToolbarModule, MatButtonModule, MatGridListModule, MatCardModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })(class {});

    const moduleFactory = await this.compiler.compileModuleAsync(tmpModule);
    const moduleRef = moduleFactory.create(this.injector);

    const compFactory = moduleRef.componentFactoryResolver.resolveComponentFactory(tmpCmp);
    this.dynamicContentContainer.createComponent(compFactory);
  }
}
