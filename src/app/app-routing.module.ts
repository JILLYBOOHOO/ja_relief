import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WifiAccessComponent } from './pages/wifi-access/wifi-access.component';

import { HomeComponent } from './pages/home/home.component';
import { SurvivorEntryComponent } from './pages/survivor-entry/survivor-entry.component';
import { DonateComponent } from './pages/donate/donate.component';


import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InfoComponent } from './pages/info/info.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';


const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'help', component: SurvivorEntryComponent },
    { path: 'donate', component: DonateComponent },
    { path: 'wifi-access', component: WifiAccessComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'info', component: InfoComponent },
    { path: 'admin', component: AdminDashboardComponent }

];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
