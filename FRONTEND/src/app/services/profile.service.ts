import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Profile } from '../profile/profile.model';
import {environment} from '../../environments/environment'
const BACKEND_URL = environment.apiUrl + "/profile"

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private profile: Profile;
  private isProfileSet: boolean = false
  private updatedProfile = new Subject<Profile>();
  public err = new BehaviorSubject<any>(null);
  constructor(
    private http: HttpClient, private router: Router
  ) { }

  getProfileUpdateListener() {
    return this.updatedProfile.asObservable();
  }

  getIsProfile() {
    return this.profile;
  }


  getIsProfileSet() {
    return this.isProfileSet
  }


  addProfile(title: string, content: string, imgpath: File) {
    const postData = new FormData();
    postData.append("username", title);
    postData.append("bio", content);
    postData.append("image", imgpath, title);

    this.http
      .post<{ message: string; post: Profile }>(
        BACKEND_URL +"/create",
        postData
      )
      .subscribe(responseData => {
        this.router.navigate(['/'])
        this.err.next(null)

      },
        err => {
          this.err.next(err)

        })

  }

  updateProfile(id: string, username: string, bio: string, image: File | string) {
    let profileData: Profile | FormData;
    if (typeof image === "object") {
      profileData = new FormData();
      profileData.append("id", id);
      profileData.append("username", username);
      profileData.append("bio", bio);
      profileData.append("image", image, username);
    } else {
      profileData = {
        id: id,
        username: username,
        bio: bio,
        imagePath: image,
        creator: null
      };
    }

    this.http
      .put(BACKEND_URL+"/edit/" + id, profileData)
      .subscribe(response => {

        this.err.next(null)
        this.router.navigate(["/profile"]);
      },
        err => {
          console.log(err)
          this.err.next(err)
        });

  }

  getProfile() {

    this.http.get<{ profile: any, message: string }>
    (BACKEND_URL + "/viewprofile")
      .subscribe(profile => {

        let prof = profile.profile
        this.profile = prof
        this.isProfileSet = true
        this.updatedProfile.next(profile.profile)
        this.saveProfileData(profile.profile)
      },
        err => {
        })

  }

  getProfileByCreatorId() {
    return this.http.get<{ profile: any, message: string }>
    (BACKEND_URL+"/viewprofile")
  }

  getPostUserByCreatorId(creatorId) {
    return this.http.get<{ profile: any, message: string }>
    (BACKEND_URL+"/bycreator/" + creatorId)
  }

  getAllUsers() {
    return this.http.get<{ profile: any, message: string }>
      (BACKEND_URL+"/profiles")
  }

  getProfileByUsername(uname: string) {
    return this.http.get<{ profile: any, message: string }>
      (BACKEND_URL +"/"+ uname)
  }

  getMyPost(uname: string) {
    return this.http.get<{ post: any, message: string }>
      (BACKEND_URL +"/"+ uname + "/mypost")

  }

  saveProfileData(profile) {
    localStorage.setItem("profile", profile)
    localStorage.setItem("uname", profile.username)
  }

  autogetProfile() {
    const profile = localStorage.getItem("profile")
    if (profile) {
      this.isProfileSet = true
    }
  }
}
