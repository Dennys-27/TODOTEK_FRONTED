import { Component, Input, OnInit } from '@angular/core';
import { ProductoService } from 'src/app/servicios/producto.service';

@Component({
  selector: 'app-ver-producto-modal',
  templateUrl: './ver-producto-modal.component.html',
  styleUrls: ['./ver-producto-modal.component.css']
})
export class VerProductoModalComponent implements OnInit {
  @Input() productoId!: number; // Recibirás el ID del producto como Input
  productos: any = {}; // Aquí se almacenarán los detalles del producto
  isLoading: boolean = false; // Indicador de carga

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    
    console.log('ngOnChanges disparado, productoId:', this.productoId); // Log para verificar
    if (this.productoId) {
      this.isLoading = true;
      this.cargarProducto();
    }


  }

  cargarProducto() {
    console.log('Producto ID recibido:', this.productoId);
    if (!this.productoId) {
      console.error('El ID del producto es nulo o indefinido.');
      this.isLoading = false;
      return;
    }
  
    this.productoService.verProducto(this.productoId).subscribe({
      next: (data) => {
        console.log('Datos del producto recibidos:', data); // Verifica los datos recibidos
        if (data.success) {
          this.productos = data.data; // Asignar el objeto completo de producto a la variable productos
          this.isLoading = false; // Cambiar a false cuando los datos están disponibles
        } else {
          console.error('Producto no encontrado');
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar el producto:', err);
        this.isLoading = false;
      }
    });
  }
  
  
  

  cerrarModal() {
    const modalElement = document.getElementById('verProductoModal');
    if (modalElement) {
      modalElement.style.display = 'none'; // Oculta el modal
    }
  }
}
