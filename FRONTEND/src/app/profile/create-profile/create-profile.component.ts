import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { mimeType } from '../../posts/create-post/mime-type.validator';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../profile.model';

@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.css']
})
export class CreateProfileComponent implements OnInit {
  form: FormGroup;
  isLoading: boolean = true
  imagePreview: string
  post: any;
  uname: string
  error: string
  private mode = "create";
  private profileId: string;
  constructor(private profileService: ProfileService
    , private router: Router,
    public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("profileId")) {
        this.mode = "edit";
        this.uname = paramMap.get("profileId");
        this.getProfileById(this.uname)
      }
      else {
        this.mode = "create";
        this.uname = null;

      }
    })
    this.createForm()
    this.checkProfileExist()
  }

  getProfileById(id) {
    this.isLoading = true
    this.profileService.getProfileByUsername(id).subscribe(profile => {
      this.isLoading = false
      this.post = {
        id: profile.profile._id,
        username: profile.profile.username,
        bio: profile.profile.bio,
        imagePath: profile.profile.imagePath,
        creator: profile.profile.creator
      };
      this.profileId = profile.profile._id
      this.imagePreview = profile.profile.imagePath
      this.form.setValue({
        username: this.post.username,
        bio: this.post.bio,
        image: this.post.imagePath
      });

    })
  }

  checkProfileExist() {
    this.isLoading = true
    this.profileService.getProfileByCreatorId().subscribe(profile => {
      console.log(profile)
      if (profile) {
        let uname = profile.profile.username
        if (this.mode == "create")
          this.router.navigate(['/profile', uname])
      }else{
        this.isLoading = false
      }
    },e=>{
      this.isLoading = false
    })

  }
  createForm() {
    this.form = new FormGroup({
      username: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      bio: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;

    if (this.mode === "create") {
      this.profileService.addProfile(
        this.form.value.username,
        this.form.value.bio,
        this.form.value.image
      );
    }
    else {
      this.profileService.updateProfile(
        this.profileId,
        this.form.value.username,
        this.form.value.bio,
        this.form.value.image
      );
    }
    this.form.reset();
  }


  clearError() {
    this.error = ''
  }

  checkUsername(uname) {
    this.profileService.getProfileByUsername(uname).subscribe(profile => {
      if (profile && uname !== this.uname) {
        this.error = "Username is already taken!"
      }

    })
  }
}
