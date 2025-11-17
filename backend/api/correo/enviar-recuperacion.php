<?php
/**
 * API: Enviar enlace de recuperación de contraseña
 * Método: POST
 * Parámetros esperados: { "email": "correo@example.com" }
 */

declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../library/vendor/autoload.php';
require_once __DIR__ . '/../../library/config-email.php';
require_once __DIR__ . '/../../conexion.php';

use PHPMailer\PHPMailer\PHPMailer;

try {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    if (!$data || empty($data['email'])) {
        echo json_encode([
            'resultado' => 'ERROR',
            'mensaje' => 'Debe proporcionar un correo.'
        ]);
        exit;
    }

    $email = trim($data['email']);

    // Conexión DB
    $db = DB::conectar();

    // Verificar si existe el usuario
    $stmt = $db->prepare("
        SELECT ID_USUARIO, EMAIL, PRIMER_NOMBRE 
        FROM usuario 
        WHERE EMAIL = :email
    ");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            'resultado' => 'ERROR',
            'mensaje' => 'El correo no está registrado.'
        ]);
        exit;
    }

    // Crear token único
    $token = bin2hex(random_bytes(32)); // 64 chars
    $expira = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Guardar token en la DB
    $upd = $db->prepare("
        UPDATE usuario SET 
            TOKEN_RECUPERACION = :token,
            TOKEN_EXPIRA = :expira
        WHERE ID_USUARIO = :id
    ");

    $upd->execute([
        ':token' => $token,
        ':expira' => $expira,
        ':id' => $user['ID_USUARIO']
    ]);

    // Crear link
    $link = "http://localhost:4200/nueva-clave?token={$token}";

    // Enviar email
    $cfg = get_mail_config();
    $mail = new PHPMailer(true);
    $mail->CharSet = "UTF-8";

    $mail->isSMTP();
    $mail->Host = $cfg['host'];
    $mail->SMTPAuth = true;
    $mail->Username = $cfg['username'];
    $mail->Password = $cfg['password'];
    $mail->SMTPSecure = $cfg['secure'];
    $mail->Port = $cfg['port'];
    $mail->setFrom($cfg['from'], $cfg['from_name']);
    $mail->addAddress($user['EMAIL'], $user['PRIMER_NOMBRE']);
    $mail->isHTML(true);

    $mail->Subject = "Recuperación de contraseña - Retrofit31";
    $mail->Body = "
        <h2>Hola, {$user['PRIMER_NOMBRE']} 👋</h2>
        <p>Solicitaste recuperar tu contraseña en <strong>Retrofit 31</strong>.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <p><a href='{$link}' 
            style='background:#004D00;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold'>
            Crear nueva contraseña
        </a></p>
        <p>Este enlace expirará en 1 hora.</p>
    ";

    $mail->send();

    echo json_encode([
        'resultado' => 'OK',
        'mensaje' => $cfg['is_sandbox']
            ? 'Correo simulado enviado a Mailtrap.'
            : 'Correo enviado correctamente.',
        'sandbox' => $cfg['is_sandbox']
    ]);

} catch (Throwable $e) {
    echo json_encode([
        'resultado' => 'ERROR',
        'mensaje' => $e->getMessage()
    ]);
}
