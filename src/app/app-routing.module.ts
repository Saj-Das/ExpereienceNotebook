import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DetailsComponent } from './details/details.component';
import { HomePage } from './home/home.page';
import { TestComponent } from './test/test.component';

const routes: Routes = [
  { path: '', component:HomePage  },
  { path: 'details/:id', component: DetailsComponent },
  { path: 'test', component: TestComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
