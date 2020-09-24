import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { PostService } from '../../services/post.service';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit, OnDestroy {
  isAuth
  isloading = false;
  url: string
  error: any
  postId: string;
  post: Post;
  userId: String;
  userIsAuthenticated: boolean
  private authStatusSub: Subscription;

  constructor(
    public postsService: PostService,
    public route: ActivatedRoute,
    public router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.url = this.router.url.split("/")[1]

    this.authData()
    this.getErrors()

    this.route.paramMap.subscribe((paramMap: ParamMap) => {

      if (paramMap.has("postId")) {
        this.postId = paramMap.get("postId");
        this.getPostById(this.postId)
      }
    })
  }

  authData() {
    this.isAuth = this.authService.getIsAuth()
    this.userId = this.authService.getUserId();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }
  getErrors() {
    this.error = null
    this.postsService.err.subscribe(err => {
      this.error = err
      this.isloading = false

    })

  }

  getPostById(id) {
    this.isloading = true
    this.postsService.getPost(this.postId).subscribe(postData => {
      console.log(postData)
      this.post = {
        id: postData._id,
        title: postData.title,
        content: postData.content,
        imagePath: postData.imagePath,
        creator: postData.creator
      };
      // this.compareIds(this.userId,this.post.creator)
      this.isloading = false
    })
    e => {
      this.error = e
      console.log(e)
    }
  }



  OnDelete(postId: string) {
    this.postsService.deletePost(postId);
  }

  ngOnDestroy() {

    this.authStatusSub.unsubscribe();
  }
}
