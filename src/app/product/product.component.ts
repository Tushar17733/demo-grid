import { Component, OnInit } from '@angular/core';
import { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.interface';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  rowData: Product[] = [];
  gridApi!: GridApi;
  quickFilter = '';

  columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 130,
      filter: 'agNumberColumnFilter',
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    {
      headerName: 'Product Info',
      children: [
        { columnGroupShow: 'closed', headerName: 'Title', field: 'title', width: 370, },
        {
          columnGroupShow: 'open', headerName: 'Category', field: 'category', width: 250,
        },
        {
          columnGroupShow: 'open', headerName: 'Brand', field: 'brand', width: 250,
        }
      ]
    },

    {
      headerName: 'Thumbnail',
      field: 'thumbnail',
      cellRenderer: (params: any) => `<img src="${params.value}" width="50"/>`,
      flex: 1
    },

    {
      headerName: 'Images',
      field: 'images',
      cellRenderer: (p: any) => p.value?.map((i: string) => `<img src="${i}" width="40"/>`).join(' '),
      flex: 1
    },

    {
      field: 'price',
      valueFormatter: p => '$' + p.value,
      flex: 1
    },
    { field: 'stock', flex: 1 },

    {
      headerName: 'Actions',
      cellRenderer: (params: any) => {
        return `
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        `;
      },
      onCellClicked: (params: any) => {
        if (params.event.target.classList.contains('edit-btn')) this.edit(params.data);
        if (params.event.target.classList.contains('delete-btn')) this.delete(params.data);
      },
      flex: 1
    }
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    suppressMovable:true
  };

  constructor(private ps: ProductService, private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.ps.getProducts().subscribe(res => (this.rowData = res));
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  edit(product: Product) {
    const ref = this.dialog.open(ProductDialogComponent, { width: '600px', data: product });

    ref.afterClosed().subscribe((updated: Product) => {
      if (!updated) return;
      this.rowData = this.rowData.map(p => (p.id === updated.id ? updated : p));
      this.showMessage('Product updated successfully ');
    });

  }

  delete(product: Product) {
    this.rowData = this.rowData.filter(p => p.id !== product.id);
    this.showMessage('Product deleted successfully ');
  }

  addProduct() {
    const ref = this.dialog.open(ProductDialogComponent, { width: '600px', data: null });

    ref.afterClosed().subscribe((newProduct: Product) => {
      if (!newProduct) return;

      // 1️⃣ Find highest existing ID
      const maxId = this.rowData.length
        ? Math.max(...this.rowData.map(p => p.id))
        : 0;

      // 2️⃣ Assign next ID
      newProduct.id = maxId + 1;

      // 3️⃣ Append at last & refresh grid properly
      this.gridApi.applyTransaction({
        add: [newProduct],
        addIndex: this.rowData.length
      });

      this.showMessage('Product added successfully ✅');

    });
  }

  showMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['light-snackbar']
    });
  }

  onSearch(value: string) {
    this.gridApi.setQuickFilter(value);
  }
}