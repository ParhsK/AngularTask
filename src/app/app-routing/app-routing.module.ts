import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from '../main-layout/main-layout.component';

const routes: Routes = [
  {
    path: 'plate/:id',
    pathMatch: 'full',
    component: MainLayoutComponent,
  },
  {
    path: '',
    component: MainLayoutComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
