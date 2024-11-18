import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductoService } from '../servicios/producto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  productos: any[] = [];
  productoSeleccionado: any = null;
  modalTitle: string = '';
  isLoading: boolean = false
  productoForm: FormGroup;
  productoSeleccionadoId!: number;
  // Paginación
  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 5;
  totalPages: number = 0;


  // Parámetros de búsqueda y filtrado
  searchTerm: string = '';
  filtroNombre: string = '';
  filtroDescripcion: string = '';


  constructor(private productoService: ProductoService, private fb: FormBuilder) {
    this.productoForm = this.fb.group({
      id: new FormControl(''),
      nombre: new FormControl('', [Validators.required]),
      descripcion: new FormControl('', [Validators.required]),
      precio: new FormControl('', [Validators.required, Validators.min(0)]),
      categoria: new FormControl('', [Validators.required]),
      codigo_sap: new FormControl('', [Validators.required]),
      stock: new FormControl('', [Validators.required, Validators.min(1)]),
      fecha_vencimiento: new FormControl('', [Validators.required]),
      descuento: new FormControl('', [Validators.required, Validators.min(0)]),
      marca: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.loadProductos(); // Cargar los productos al iniciar el componente
  }


  loadProductos(): void {
    this.productoService.obtenerProductos(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm,
      this.filtroNombre,
      this.filtroDescripcion,

    ).subscribe(
      (response: any) => {
        if (response.success) {
          this.productos = response.data.data; // Productos de la página actual
          this.totalItems = response.data.total; // Total de productos
          this.totalPages = response.data.last_page; // Total de páginas basado en Laravel
        } else {
          console.error('Error al obtener productos', response.message);
        }
      },
      (error) => {
        console.error('Error al hacer la solicitud:', error);
      }
    );
  }


  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
      this.loadProductos(); // Cargar productos de la nueva página
    }
  }


  buscarProductos(): void {
    this.currentPage = 1; // Reiniciar a la primera página cuando se realice una búsqueda
    this.loadProductos(); // Cargar productos con los filtros de búsqueda
  }


  abrirModales(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error(`El modal con ID ${modalId} no existe.`);
    }
  }


  abrirModal(): void {
    this.modalTitle = 'Agregar Producto';
    const modalElement = document.getElementById('productoModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }


  abrirModalEditar(productoId: number): void {
    this.isLoading = true;

    this.productoService.verProducto(productoId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.productoSeleccionado = response.data;
          this.productoSeleccionadoId = productoId;

          this.productoForm.patchValue({
            nombre: response.data.nombre,
            descripcion: response.data.descripcion,
            precio: response.data.precio,
            categoria: response.data.categoria,

            codigo_sap: response.data.codigo_sap,
            stock: response.data.stock,
            fecha_vencimiento: response.data.fecha_vencimiento,
            descuento: response.data.descuento,
            marca: response.data.marca,
          });

          this.modalTitle = 'Editar Producto'; // Cambiar título del modal
          const modalElement = document.getElementById('productoModal');
          if (modalElement) {
            const modal = new (window as any).bootstrap.Modal(modalElement);
            modal.show();
          }
        } else {
          console.error('Producto no encontrado');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar el producto:', err);
        this.isLoading = false;
      },
    });
  }


  agregarProducto(): void {
    if (this.productoForm.valid) {
      const formData = new FormData();


      Object.keys(this.productoForm.controls).forEach((key) => {
        const value = this.productoForm.get(key)?.value;
        formData.append(key, value instanceof File ? value : value || '');
      });


      this.productoService.agregarProducto(formData).subscribe(
        (response: any) => {
          if (response.success) {

            Swal.fire({
              icon: 'success',
              title: 'Producto agregado con éxito',
              text: `El producto ${response.data.nombre} ha sido agregado correctamente.`,
              confirmButtonText: '¡Genial!',
            });


            this.productos.push(response.data);


            this.productoForm.reset();


            const modalElement = document.getElementById('productoModal');
            if (modalElement) {
              const modal = new (window as any).bootstrap.Modal(modalElement);
              modal.hide();
            }
          } else {

            Swal.fire({
              icon: 'error',
              title: 'Error al agregar el producto',
              text: response.message || 'Hubo un error al agregar el producto. Por favor, intenta nuevamente.',
              confirmButtonText: 'Aceptar',
            });
          }
        },
        (error) => {

          console.error('Error al agregar producto:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'Ocurrió un error al intentar agregar el producto. Por favor, revisa tu conexión y vuelve a intentarlo.',
            confirmButtonText: 'Cerrar',
          });
        }
      );
    } else {

      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos obligatorios.',
        confirmButtonText: 'Entendido',
      });
    }
  }




  guardarProducto() {
    if (this.productoForm.invalid) {
      
      this.productoForm.markAllAsTouched();
      return;
    }


    if (this.productoSeleccionado?.id) {
      this.actualizarProducto();
    } else {
      this.agregarProducto();
    }
  }

  verDetalle(productoId: number): void {
    this.isLoading = true;
    this.productoService.verProducto(productoId).subscribe({
      next: (response: any) => {
        if (response.success) {

          this.productoSeleccionado = response.data;


          this.abrirModales('modalVerProducto');
        } else {
          console.error('Producto no encontrado');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar el producto:', err);
        this.isLoading = false;
      }
    });
  }



  editarProducto(productoId: number): void {
    this.isLoading = true;
    console.log('Inicio de editarProducto con productoId:', productoId);

    this.productoService.verProducto(productoId).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servicio verProducto:', response);

        if (response.success) {
          console.log('Producto encontrado:', response.data);
          this.productoSeleccionado = response.data;

          console.log('Formulario antes de patchValue:', this.productoForm.value);
          this.productoForm.patchValue({
            id: this.productoSeleccionado?.id,
            nombre: response.data.nombre || '',
            descripcion: response.data.descripcion || '',
            precio: response.data.precio || 0,
            categoria: response.data.categoria || '',
            codigo_sap: response.data.codigo_sap || '',
            stock: response.data.stock || 0,
            fecha_vencimiento: response.data.fecha_vencimiento || '',
            descuento: response.data.descuento || 0,
            marca: response.data.marca || '',
          });
          console.log('Formulario después de patchValue:', this.productoForm.value);

          this.abrirModalEditar(productoId);
        } else {
          console.log('Producto no encontrado. Response.success es falso');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.log('Error al cargar el producto:', err);
        this.isLoading = false;
      },
    });
  }

  actualizarProducto(): void {
    console.log('Inicio de actualizarProducto');

    if (this.productoForm.valid && this.productoSeleccionadoId) {
      console.log('Formulario es válido. ProductoSeleccionadoId:', this.productoSeleccionadoId);

      const formData = new FormData();
      Object.keys(this.productoForm.controls).forEach((key) => {
        const value = this.productoForm.get(key)?.value;
        formData.append(key, value instanceof File ? value : value || '');
      });

      const datosFormData: { [key: string]: string | File } = {};
      formData.forEach((value, key) => {
        datosFormData[key] = value;
      });
      console.log('Datos enviados a actualizarProducto:', datosFormData);

      this.productoService.actualizarProducto(this.productoSeleccionadoId, formData).subscribe({
        next: (response: any) => {
          console.log('Respuesta del servicio actualizarProducto:', response);

          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Producto actualizado',
              text: `El producto ${response.data.nombre} se ha actualizado correctamente.`,
              confirmButtonText: 'Aceptar',
            });

            this.loadProductos();

            const modalElement = document.getElementById('productoModal');
            if (modalElement) {
              const modal = new (window as any).bootstrap.Modal(modalElement);
              modal.hide();
            }
          } else {
            console.log('Error al actualizar el producto. Response.success es falso:', response.message);
            Swal.fire({
              icon: 'error',
              title: 'Error al actualizar',
              text: response.message || 'Hubo un error al actualizar el producto.',
              confirmButtonText: 'Aceptar',
            });
          }
        },
        error: (err) => {
          console.log('Error al intentar actualizar el producto:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'Ocurrió un error al intentar actualizar el producto.',
            confirmButtonText: 'Cerrar',
          });
        },
      });
    } else {
      console.log('Formulario no es válido o ProductoSeleccionadoId no está definido');
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos obligatorios.',
        confirmButtonText: 'Entendido',
      });
    }
  }





  eliminarProducto(id: number) {

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Este producto será eliminado!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.eliminarProducto(id).subscribe(
          response => {
            Swal.fire('Eliminado!', 'El producto ha sido eliminado.', 'success');
            this.loadProductos();
          },
          error => {
            console.error('Error al eliminar el producto:', error);
            Swal.fire('Error!', 'Hubo un problema al eliminar el producto.', 'error');
          }
        );
      }
    });
  }






}
