import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from '../../services/post.service';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { AuthService } from '../../auth/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../profile/profile.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  private authListenerSubs: Subscription;

  posts: Post[] = [];
  user: Profile[] = []
  postbyUser: Profile[] = []
  isloading = false;
  error: any
  userId: string
  private postsSub: Subscription;
  constructor(private ps: PostService,
    private authService: AuthService,
    private profileService: ProfileService) { }

  ngOnInit(): void {
    this.checkAuth()
    this.getErrors()
    this.getUsers()
    this.isloading = true
    this.userId = this.authService.getUserId();
    this.ps.getPosts()

    this.postsSub = this.ps.getPostUpdateListener()
      .subscribe((posts: Post[]) => {


        this.isloading = false;
        this.posts = posts;
        this.sortPostByDate(posts)
        this.getPostUserbyCreatorId(this.posts)
        console.log("posts is", this.posts)
      }, e => {
        this.isloading = false;
        this.error = e
      });
  }

  sortPostByDate(post){
    post.sort((a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime());

  }
  getErrors() {
    this.error = null
    this.ps.err.subscribe(err => {
      this.error = err
      this.isloading = false
    })
  }

  checkAuth() {
    this.userIsAuthenticated = this.authService.getIsAuth();

    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        
        this.userIsAuthenticated = isAuthenticated;
        this.getUserProfile()
      });
  }

  getUserProfile(){

  }

  getUsers() {
    this.profileService.getAllUsers().subscribe(user => {
      this.user = user.profile
    })
  }

  getPostUserbyCreatorId(post: Post[]) {
    let creatorId = []
    for (let i in post) {
      creatorId.push(post[i].creator)

    }

    let unique = [...new Set(creatorId)];
    for (let i in unique) {
      this.profileService.getPostUserByCreatorId(unique[i])
        .subscribe(user => {
          this.postbyUser.push(user.profile)

        })
    }

  }


  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authListenerSubs.unsubscribe();
  }

}



