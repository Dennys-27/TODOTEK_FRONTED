import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { AppComponent } from './app.component';
import { ProductosComponent } from './productos/productos.component';
import { VerProductoModalComponent } from './components/modals/ver-producto-modal/ver-producto-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    ProductosComponent,
    VerProductoModalComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule, // ¡Importante!
    HttpClientModule,
    FormsModule // Para manejar las peticiones al backend
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
