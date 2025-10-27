<?php
/**
 * Configuración centralizada de email para Retrofit31
 * - Modo diseño: usa Mailtrap (no envía a buzones reales).
 * - Modo producción: usa Gmail (SMTP) con contraseña de aplicación.
 * 
 * Ubicación recomendada: backend/library/config-email.php
 */

declare(strict_types=1);

// Zona horaria (coherente con tu proyecto)
date_default_timezone_set('America/Bogota');

/**
 * Alterna entre diseño y producción.
 * true  = Mailtrap (sandbox, pruebas)
 * false = Gmail real (o tu propio SMTP en prod)
 */
$modoDiseno = true;

/**
 * Puedes sobreescribir credenciales vía variables de entorno si quieres:
 * (útil para servidores)
 * putenv('MAIL_HOST=smtp.mailtrap.io');
 * putenv('MAIL_USER=...');
 * putenv('MAIL_PASS=...');
 * putenv('MAIL_PORT=2525');
 */

if ($modoDiseno) {
    // --- Mailtrap (Sandbox) ---
    $MAIL_HOST = getenv('MAIL_HOST') ?: 'sandbox.smtp.mailtrap.io'; // Datos dados por mailstrap
    $MAIL_USER = getenv('MAIL_USER') ?: '260ea31471dc37'; // datos dados por mailstrap
    $MAIL_PASS = getenv('MAIL_PASS') ?: 'f95eee44de19ee'; // datos dados por mailstrap
    $MAIL_PORT = (int) (getenv('MAIL_PORT') ?: 2525);
    $MAIL_SECURE = 'tls';
    $MAIL_FROM = 'notificaciones@retrofit31.local';
    $MAIL_FROM_NAME = 'Retrofit31 (Sandbox)';
} else {
    // --- Gmail (Producción) ---
    $MAIL_HOST = getenv('MAIL_HOST') ?: 'smtp.gmail.com';
    $MAIL_USER = getenv('MAIL_USER') ?: 'notificaciones.retrofit31@gmail.com';
    // Usa contraseña de aplicación de Gmail (no la normal)
    $MAIL_PASS = getenv('MAIL_PASS') ?: 'TU_CONTRASENA_DE_APLICACION';
    $MAIL_PORT = (int) (getenv('MAIL_PORT') ?: 587);
    $MAIL_SECURE = 'tls';
    $MAIL_FROM = 'notificaciones@retrofit31.com';
    $MAIL_FROM_NAME = 'Retrofit31';
}

/**
 * Función helper para obtener la configuración lista.
 */
function get_mail_config(): array
{
    // Trae las variables definidas arriba
    return [
        'host' => $GLOBALS['MAIL_HOST'],
        'username' => $GLOBALS['MAIL_USER'],
        'password' => $GLOBALS['MAIL_PASS'],
        'port' => $GLOBALS['MAIL_PORT'],
        'secure' => $GLOBALS['MAIL_SECURE'],
        'from' => $GLOBALS['MAIL_FROM'],
        'from_name' => $GLOBALS['MAIL_FROM_NAME'],
        'is_sandbox' => (bool) $GLOBALS['modoDiseno'],
    ];



}
