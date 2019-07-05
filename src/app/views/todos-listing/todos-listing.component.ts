import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormArray
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MatSnackBar, MatDialog } from "@angular/material";
import { UserAPIService } from "app/userapi.service";
import { AppLoaderService } from "app/shared/services/app-loader/app-loader.service";

@Component({
  selector: "app-todos-listing",
  templateUrl: "./todos-listing.component.html",
  styleUrls: ["./todos-listing.component.scss"]
})
export class TodosListingComponent implements OnInit {
  userId: string;
  endUserType: string;
  todoList: any;
  viewMode:any = 100000;
  todosForm: FormGroup;
  todosUpdateForm: FormGroup;
  updateTodosButton:boolean=true;
  viewMoreStatus:boolean=false

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private loader: AppLoaderService,
    private userapi: UserAPIService,
    private snack: MatSnackBar
  ) {

  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.endUserType = localStorage.getItem("endUserType");

    this.todosForm = this.fb.group({
      comments: new FormControl("", Validators.required)
    });

    this.todosUpdateForm = this.fb.group({
      update_comments: new FormControl("", Validators.required)
    });
    this.getTodos();
  }

  // get list of todo's
  async getTodos(query = {}, search = false) {
    const params = {
      query: Object.assign({ customerId: this.userId }, query),
      fields: {},
      offset: 0,
      limit: 0,
      order: { modifiedOn: -1 }
    };
    await this.userapi.apiRequest("post", "todos/todos-list", params).subscribe(
      result => {
        if (result.status == "error") {
          console.log("Error while fetching list");
        } else {
          this.viewMode = 100000
          this.todoList = result.data.todoList
          if(this.todoList.length > 0){
            this.viewMoreStatus = true
          }else{
            this.viewMoreStatus = false
          }
        }
      },
      err => {
        console.error(err);
      }
    );
  }

  edit(rowIndex){
    this.viewMode = rowIndex
  } 

  updateCommentCheck(formdata){
    if(formdata.update_comments.trim() == ""){
      this.updateTodosButton = false
    }else{
      this.updateTodosButton = true
    }
  }
  
  delete(id){
    let data = {
      "_id" : id
    }
    this.loader.open();
    this.userapi.apiRequest("post", "todos/delete-todos", data).subscribe(
      result => {
        this.loader.close();
        if (result.status == "error") {
          this.snack.open(result.data.message, "OK", { duration: 4000 });
        } else {
          this.snack.open(result.data.message, "OK", { duration: 4000 });
          this.todosForm.reset();
          this.getTodos();
        }
      },
      err => {
        console.error(err);
      }
    ); 
  }

  todosFormUpdate(){
    let params = {
      "_id" : this.todoList[this.viewMode]._id,
      "comments" : this.todosUpdateForm.value.update_comments
    }
    this.loader.open();
    this.userapi.apiRequest("post", "todos/update-todos", params).subscribe(
      result => {
        this.loader.close();
        if (result.status == "error") {
          this.snack.open(result.data.message, "OK", { duration: 4000 });
        } else {
          this.snack.open(result.data.message, "OK", { duration: 4000 });
          this.todosForm.reset();
          this.getTodos();
        }
      },
      err => {
        console.error(err);
      });
  }
}
