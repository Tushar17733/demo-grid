import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Product } from '../models/product.interface';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss']
})
export class ProductDialogComponent {
  imagesPreview: string[] = [];
  thumbnailPreview = '';

  get isEditMode(): boolean {
    return !!this.data;
  }

  form = this.fb.group({
    id: [0],
    title: ['', Validators.required],
    category: ['', Validators.required],
    brand: ['', Validators.required],
    price: [null, [Validators.required, Validators.min(0)]],
    stock: [null, [Validators.required, Validators.min(0)]],
    thumbnail: [''],
    images: [[] as string[]]
  });

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.form.patchValue(data);
      this.thumbnailPreview = data.thumbnail;
      this.imagesPreview = data.images;
    }
  }

  onThumbnailUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.thumbnailPreview = reader.result as string;
      this.form.patchValue({ thumbnail: this.thumbnailPreview });
    };
    reader.readAsDataURL(file);
  }

  onImagesUpload(event: any) {
    const files = Array.from(event.target.files);

    files.forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagesPreview.push(reader.result as string);
        this.form.patchValue({ images: this.imagesPreview });
      };
      reader.readAsDataURL(file);
    });
  }

  save() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    // Ensure all required Product fields are present
    const payload: Product = {
      id: formValue.id ?? 0,
      title: formValue.title ?? '',
      category: formValue.category ?? '',
      brand: formValue.brand ?? '',
      price: formValue.price ?? 0,
      stock: formValue.stock ?? 0,
      thumbnail: formValue.thumbnail ?? '',
      images: formValue.images ?? [],
    };

    this.productService.addProduct(payload)
      .subscribe(res => {
        this.dialogRef.close(res);
      });
      
      //closing dialog will get form values in UI
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }

}