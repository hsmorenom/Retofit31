<?php
require_once __DIR__ . '/../library/vendor/autoload.php';
require_once __DIR__ . '/../library/config-email.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class CorreoController
{
    public function enviarRecordatorio(array $destino, array $evento, string $tipo = 'correo'): array
    {
        // 🟢 Caso 1: Mensaje (SMS simulado)
        if ($tipo === 'mensaje') {
            $mensaje = "Hola {$destino['nombre']}, te recordamos tu evento: {$evento['nombre']} "
                . "el {$evento['fecha']} a las {$evento['hora']} en {$evento['lugar']}.";

            // Simulación de envío de SMS
            error_log("📱 SMS simulado a {$destino['telefono']}: {$mensaje}");

            return [
                'resultado' => 'OK',
                'tipo' => 'mensaje',
                'sandbox' => true,
                'mensaje' => "Simulación de mensaje de texto a {$destino['telefono']}"
            ];
        }

        // 🟢 Caso 2: Correo real
        $cfg = get_mail_config();
        $mail = new PHPMailer(true);
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        try {
            $mail->isSMTP();
            $mail->Host = $cfg['host'];
            $mail->SMTPAuth = true;
            $mail->Username = $cfg['username'];
            $mail->Password = $cfg['password'];
            $mail->SMTPSecure = $cfg['secure'];
            $mail->Port = $cfg['port'];

            $mail->setFrom($cfg['from'], $cfg['from_name']);
            $mail->addAddress($destino['correo'], $destino['nombre']);

            $mail->isHTML(true);
            $mail->Subject = '📅 Recordatorio — ' . $evento['nombre'];

            $fechaBonita = date('d/m/Y', strtotime($evento['fecha']));
            $mail->Body = "
                <div style='font-family:Arial;padding:16px;border:1px solid #eee;border-radius:12px'>
                    <h2>Hola, {$destino['nombre']} 👋</h2>
                    <p>Este es tu recordatorio para el evento en <strong>Retrofit 3.1</strong>:</p>
                    <ul>
                        <li><strong>Evento:</strong> {$evento['nombre']}</li>
                        <li><strong>Fecha:</strong> {$fechaBonita}</li>
                        <li><strong>Hora:</strong> {$evento['hora']}</li>
                        <li><strong>Lugar:</strong> {$evento['lugar']}</li>
                    </ul>
                    <p>Llega 10 minutos antes. Si no puedes asistir, responde este correo.</p>
                </div>";

            $mail->AltBody = "Hola, {$destino['nombre']}\nEvento: {$evento['nombre']}\nFecha: {$fechaBonita}\nHora: {$evento['hora']}\nLugar: {$evento['lugar']}";

            $mail->send();

            return [
                'resultado' => 'OK',
                'tipo' => 'correo',
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
}
