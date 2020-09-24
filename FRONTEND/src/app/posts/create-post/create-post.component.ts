import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Post } from '../post.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from './mime-type.validator';
import { PostService } from '../../services/post.service';


@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {

  postdate: Date
  fetchedDate: Date
  form: FormGroup;
  isLoading: boolean = false
  imagePreview: string
  post: Post;
  private mode = "create";
  private postId: string;
  constructor(
    private ps: PostService,
    public route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        this.getPostById(this.postId)
      }
      else {
        this.mode = "create";
        this.postId = null;

      }
    })
    this.createForm()
  }

  getPostById(id) {
    this.isLoading=true
    this.ps.getPost(id).subscribe(postData => {
    
      this.post = {
        id: postData._id,
        title: postData.title,
        content: postData.content,
        imagePath: postData.imagePath,
        creator: postData.creator
      };

      console.log(postData)
      this.imagePreview = postData.imagePath
      this.form.setValue({
        title: this.post.title,
        content: this.post.content,
        image: this.post.imagePath
      });
      this.isLoading = false;
    });

  }

  createForm() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
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
    this.postdate = new Date()
    console.log(this.postdate)
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    console.log(this.form.value)
    if (this.mode === "create") {
      console.log("inside")
      this.ps.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image,
        this.postdate
      );
    }
    else {
      this.ps.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    this.form.reset();
  }
}


