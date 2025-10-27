<?php
/**
 * Controlador de correo para Retrofit 3.1
 * Ubicación: backend/controlador/CorreoController.php
 */

declare(strict_types=1);

// Autoload de Composer del backend
require_once __DIR__ . '/../library/vendor/autoload.php';
// Configuración de email (modo diseño/producción)
require_once __DIR__ . '/../library/config-email.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class CorreoController
{

    /**
     * Envía un recordatorio de evento/asistencia al cliente.
     * $destino = ['correo' => '...', 'nombre' => '...']
     * $evento  = [
     *    'nombre' => 'Entrenamiento funcional',
     *    'fecha'  => '2025-11-02',        // YYYY-MM-DD
     *    'hora'   => '18:00',             // HH:MM (24h)
     *    'lugar'  => 'Sede Norte'
     * ]
     */
    public function enviarRecordatorio(array $destino, array $evento): array
    {
        // Validaciones mínimas
        if (empty($destino['correo']) || empty($destino['nombre'])) {
            return ['resultado' => 'ERROR', 'mensaje' => 'Faltan datos del destinatario'];
        }
        if (empty($evento['nombre']) || empty($evento['fecha']) || empty($evento['hora']) || empty($evento['lugar'])) {
            return ['resultado' => 'ERROR', 'mensaje' => 'Faltan datos del evento'];
        }

        $cfg = get_mail_config();

        $mail = new PHPMailer(true);
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        try {
            // Config SMTP
            $mail->isSMTP();
            $mail->Host = $cfg['host'];
            $mail->SMTPAuth = true;
            $mail->Username = $cfg['username'];
            $mail->Password = $cfg['password'];
            $mail->SMTPSecure = $cfg['secure'];
            $mail->Port = $cfg['port'];

            // Remitente y destinatario
            $mail->setFrom($cfg['from'], $cfg['from_name']);
            $mail->addAddress($destino['correo'], $destino['nombre']);

            // Contenido
            $mail->isHTML(true);
            $mail->Subject = '📅 Recordatorio de asistencia — ' . $evento['nombre'];

            // Mini plantilla HTML
            $fechaBonita = date('d/m/Y', strtotime($evento['fecha']));
            $cuerpoHTML = '
                <div style="font-family:Arial,Helvetica,sans-serif;padding:16px;max-width:620px;margin:auto;border:1px solid #eee;border-radius:12px">
                    <h2 style="margin-top:0;">Hola, ' . htmlspecialchars($destino['nombre']) . ' 👋</h2>
                    <p>Este es un recordatorio para tu próximo evento en <strong>Retrofit 31</strong>:</p>
                    <ul>
                        <li><strong>Evento:</strong> ' . htmlspecialchars($evento['nombre']) . '</li>
                        <li><strong>Fecha:</strong> ' . $fechaBonita . '</li>
                        <li><strong>Hora:</strong> ' . htmlspecialchars($evento['hora']) . '</li>
                        <li><strong>Lugar:</strong> ' . htmlspecialchars($evento['lugar']) . '</li>
                    </ul>
                    <p>Por favor, llega con 10 minutos de anticipación. Si no puedes asistir, responde a este mensaje para reprogramar.</p>
                    <hr style="border:none;border-top:1px solid #ddd;margin:16px 0" />
                    <p style="font-size:12px;color:#666;margin:0">
                        ' . ($cfg['is_sandbox'] ? '🧪 Enviado en modo diseño (sandbox Mailtrap). No es un correo real.' : 'Enviado por Retrofit 3.1') . '
                    </p>
                </div>
            ';

            $mail->Body = $cuerpoHTML;
            $mail->AltBody = "Hola, {$destino['nombre']}\n\nRecordatorio de evento: {$evento['nombre']}\nFecha: {$fechaBonita}\nHora: {$evento['hora']}\nLugar: {$evento['lugar']}";

            $mail->send();

            return [
                'resultado' => 'OK',
                'mensaje' => $cfg['is_sandbox']
                    ? 'Simulación enviada a Mailtrap (sandbox).'
                    : 'Correo enviado correctamente.',
                'sandbox' => $cfg['is_sandbox'],
                'to' => $destino['correo']
            ];

        } catch (Exception $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $mail->ErrorInfo ?: $e->getMessage()];
        }
    }

    /**
     * Método opcional para probar conectividad y credenciales.
     */
    public function enviarPrueba(string $correoDestino): array
    {
        return $this->enviarRecordatorio(
            ['correo' => $correoDestino, 'nombre' => 'Prueba'],
            [
                'nombre' => 'Prueba de correo',
                'fecha' => date('Y-m-d'),
                'hora' => date('H:i'),
                'lugar' => 'Sandbox'
            ]
        );
    }
}
