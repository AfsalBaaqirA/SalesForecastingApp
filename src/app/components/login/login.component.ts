import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  title = 'Login';
  hide!: boolean;
  signIn!: boolean;
  username = '';
  password = '';
  rePassword = '';
  mailId = '';
  name = '';
  phoneNo = '';
  message = '';

  constructor(
    private titleService: Title,
    private router: Router,
    private toastr: ToastrService,
    private auth: AuthService,
    private http: HttpClient
  ) {
    this.titleService.setTitle(this.title);
  }
  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.auth.validateToken();
    }
    this.hide = true;
    this.signIn = true;
    this.username = '';
    this.password = '';
    this.message = '';
  }
  login() {
    if (this.validate()) {
      const body = {
        username: this.username,
        password: this.password
      }
      this.http.post('http://192.168.1.96:5000/api/signin', body).subscribe((data) => {
        var response = JSON.parse(JSON.stringify(data));
        if (response['status']['status'] == 200) {
          this.showToastr('Log In Successful', 'success');
          console.log(response);
          this.auth.login(response['sessionToken']);
        }
        else {
          this.showToastr(response['status']['message'], 'error');
        }
      });
    }
  }
  validate() {
    if (this.username.length < 1) {
      this.showToastr('Username cannot be empty', 'error');
      return false;
    }
    else {
      if (this.password.length < 1) {
        this.showToastr('Password cannot be empty', 'error');
        return false;
      }
    }
    return true;
  }

  signUp() {
    if (
      this.username.length > 0 &&
      this.password.length > 0 &&
      this.rePassword.length > 0 &&
      this.name.length > 0 &&
      this.mailId.length > 0 &&
      this.phoneNo.length > 0
    ) {
      var atposition = this.mailId.indexOf('@');
      var dotposition = this.mailId.lastIndexOf('.');
      if (atposition < 1 || dotposition < atposition + 2 || dotposition + 2 >= this.mailId.length) {
        this.showToastr('Invalid Email ID', 'error');
        return;
      }
      if (this.phoneNo.length !== 10) {
        this.showToastr('Invalid Phone Number', 'error');
        return;
      }
      if (this.password !== this.rePassword) {
        this.showToastr('Passwords do not match', 'error');
        return;
      }
      const body = {
        username: this.username,
        password: this.password,
        name: this.name,
        email: this.mailId,
        phone: this.phoneNo
      }
      console.log(body);
      this.http.post('http://192.168.1.96:5000/api/signup', body).subscribe((data) => {
        var response = JSON.parse(JSON.stringify(data));
        if (response['status']['status'] == 200) {
          this.showToastr('User Registration Successful', 'success');
          this.signIn = !this.signIn;
        }
        else {
          this.showToastr(response['status']['message'], 'error');
        }
      });
    }
    else {
      this.showToastr('Please fill all form fields', 'error');
    }
  }
  showToastr(title: string, type: string) {
    if (type === 'success') {
      this.toastr.success(title);
    } else if (type === 'error') {
      this.toastr.error(title);
    } else if (type === 'warning') {
      this.toastr.warning(title);
    } else if (type === 'info') {
      this.toastr.info(title);
    }
  }
}
