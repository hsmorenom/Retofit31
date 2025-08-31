// Aca se importa Routes para que se reconozca que aca se va hacer el path entre paginas
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./acceso/login/login').then(m => m.Login)
  },
  {
    path: 'inicio',
    loadComponent: () => import('./modulos/inicio/inicio').then(m => m.Inicio)
  },
  {
    path: 'registro',
    loadComponent: () => import('./acceso/registro/registro').then(m => m.Registro)
  },
  {
    path: 'recordar-clave',
    loadComponent: () => import('./acceso/recordar-clave/recordar-clave').then(m => m.RecordarClave)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./modulos/perfil/perfil').then(m => m.Perfil)
  },
  {
    path: 'administrativo',
    loadComponent: () => import('./modulos/administrativo/administrativo').then(m => m.Administrativo)
  },
  {
    path: 'asistencia',
    loadComponent: () => import('./modulos/asistencia/asistencia').then(m => m.Asistencia)
  },
  {
    path: 'eventos',
    loadComponent: () => import('./modulos/eventos/eventos').then(m => m.Eventos)
  },
  {
    path: 'fotografias',
    loadComponent: () => import('./modulos/fotografias/fotografias').then(m => m.Fotografias)
  },
  {
    path: 'antropometricos',
    loadComponent: () => import('./modulos/antropometricos/antropometricos').then(m => m.Antropometricos)
  },
  {
    path: 'consultas',
    loadComponent: () => import('./modulos/consultas/consultas').then(m => m.Consultas)
  },
  {
    path: 'nutricional',
    loadComponent: () => import('./modulos/nutricional/nutricional').then(m => m.Nutricional)
  },
  {
    path: 'pago',
    loadComponent: () => import('./modulos/pago/pago').then(m => m.Pago)
  }
];

