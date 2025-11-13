import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ToastModule} from 'primeng/toast';
import {ButtonModule} from 'primeng/button';
import {ProgressBarModule} from 'primeng/progressbar';

@NgModule({

    imports: [
        CommonModule,
        ToastModule,
        ButtonModule,
        ProgressBarModule,
    ], exports: [
        ToastModule,
        ButtonModule,
        ProgressBarModule
    ]
})
export class SharedModule {
}
