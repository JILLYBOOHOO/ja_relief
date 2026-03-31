import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ja-relief';
  showCookieBanner = true;

  ngOnInit() {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === 'true') {
      this.showCookieBanner = false;
    }
  }

  acceptCookies() {
    localStorage.setItem('cookieConsent', 'true');
    this.showCookieBanner = false;
  }
}
