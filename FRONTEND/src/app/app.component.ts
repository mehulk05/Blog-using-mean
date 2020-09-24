import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { ProfileService } from './services/profile.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService,
    private profileService:ProfileService) {}

  ngOnInit() {
   
    this.authService.autoAuthUser();

    this.profileService.autogetProfile()
  }
}
