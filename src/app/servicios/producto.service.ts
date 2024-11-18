import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Importamos el entorno

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = `${environment.apiUrl}/productos`;  // Usamos la URL de la API desde el archivo de entorno
  
  constructor(private http: HttpClient) {}

  obtenerProductos(
    page: number,
    perPage: number,
    searchTerm: string,
    filtroNombre: string,
    filtroDescripcion: string,
    
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('perPage', perPage.toString())
      .set('searchTerm', searchTerm)
      .set('filtroNombre', filtroNombre)
      .set('filtroDescripcion', filtroDescripcion)
;         // Agregamos el filtro de ID

    return this.http.get<any>(this.apiUrl, { params });
  }

  // Método para obtener un producto por su ID
  getProductoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Método para agregar un nuevo producto
  agregarProducto(producto: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, producto);
  }

  // Método para bloquear un producto
  bloquearProducto(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/bloquear/${id}`, {});
  }

  // Método para editar un producto
  editarProducto(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, producto);
  }

  actualizarProducto(id: number, producto: any): Observable<any> {
   
    return this.http.put(`${this.apiUrl}/${id}`, producto);
  }
  
  

  // Método para eliminar un producto
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Método para ver un producto (ya está implementado en getProductoById)
  verProducto(id: number): Observable<any> {
    return this.getProductoById(id); // Reutilizamos el método getProductoById
  }
}
