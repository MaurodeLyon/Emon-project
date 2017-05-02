import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class PostsService {
  constructor(private http: Http) {
    console.log('PostsService Initialized...');
  }

  getMauroMeasurements() {
    return this.http.get('http://84.105.252.233:8080/api/website/Mauro').map(res => res.json());
  }

  getArthurMeasurements() {
    return this.http.get('http://84.105.252.233:8080/api/website/Arthur').map(res => res.json());
  }
}