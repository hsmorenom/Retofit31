import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html'
})
export class Sidebar implements OnInit {

  tipoUsuario: number = 0;
  nombreUsuario: string = '';

  @Output() sidebarToggled = new EventEmitter<void>();

  constructor(
    public router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    const idUsuario = localStorage.getItem('idUsuario');

    if (idUsuario) {
      this.usuarioService.filtrarPorId(+idUsuario).subscribe((data: any) => {

    

        const tipo =
          data?.TIPO_USUARIO ||
          data?.usuario?.TIPO_USUARIO ||
          data?.[0]?.TIPO_USUARIO ||
          data?.data?.TIPO_USUARIO ||
          data?.data?.[0]?.TIPO_USUARIO ||
          null;

       

        // MAPA correcto con TUS ROLES REALES
        const mapaRoles: any = {
          "Administrador": 1,
          "Asistente-admon": 2,
          "Asistente-salud-deportiva": 3,
          "Usuario": 4
        };

        this.tipoUsuario = mapaRoles[tipo] ?? 0;

       
      });
    }
  }

  cerrarSesion() {
    localStorage.removeItem('idUsuario');
    this.router.navigate(['/']);
  }

  toggleSidebar() {
    this.sidebarToggled.emit();
  }
}
