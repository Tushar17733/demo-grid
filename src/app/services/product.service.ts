import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product.interface';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = 'https://dummyjson.com/products?limit=200';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<any>(this.api).pipe(
      map(res => res.products));
  }
  
  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(
      'https://dummyjson.com/products/add',
      product
    );
  }
}