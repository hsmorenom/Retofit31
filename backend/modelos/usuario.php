<?php

date_default_timezone_set('America/Bogota');

require_once '../conexion.php';

class UsuarioModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT u.ID_USUARIO,tu.TIPO AS TIPO_USUARIO, u.PRIMER_NOMBRE, u.SEGUNDO_NOMBRE,u.PRIMER_APELLIDO,u.SEGUNDO_APELLIDO, u.EMAIL,u.CLAVE,u.ESTADO FROM usuario u INNER JOIN tipo_usuario tu ON u.TIPO_USUARIO =tu.ID_TIPO_USUARIO";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    public function insertar($parametros)
    {
        try {
            $sql = "INSERT INTO usuario (PRIMER_NOMBRE,SEGUNDO_NOMBRE,PRIMER_APELLIDO, SEGUNDO_APELLIDO,EMAIL, CLAVE,TIPO_USUARIO, ESTADO) VALUES(:primer_nombre,:segundo_nombre,:primer_apellido,:segundo_apellido, :email, :clave , :tipo_usuario, :estado)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':primer_nombre', $parametros->primer_nombre);
            $stmt->bindParam(':segundo_nombre', $parametros->segundo_nombre);
            $stmt->bindParam(':primer_apellido', $parametros->primer_apellido);
            $stmt->bindParam(':segundo_apellido', $parametros->segundo_apellido);
            $stmt->bindParam(':email', $parametros->email);

            $claveHash = password_hash($parametros->clave, PASSWORD_DEFAULT);
            $stmt->bindParam(':clave', $claveHash);

            $stmt->bindParam(':tipo_usuario', $parametros->tipo_usuario);
            $stmt->bindParam(':estado', $parametros->estado);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Usuario registrado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    public function editar($id, $parametros)
    {
        try {
            // Normalizar claves a minúsculas
            $parametros = array_change_key_case($parametros, CASE_LOWER);

            $set = [];
            $params = [':id' => $id];

            if (isset($parametros['primer_nombre'])) {
                $set[] = "PRIMER_NOMBRE = :primer_nombre";
                $params[':primer_nombre'] = $parametros['primer_nombre'];
            }
            if (isset($parametros['segundo_nombre'])) {
                $set[] = "SEGUNDO_NOMBRE = :segundo_nombre";
                $params[':segundo_nombre'] = $parametros['segundo_nombre'];
            }
            if (isset($parametros['primer_apellido'])) {
                $set[] = "PRIMER_APELLIDO = :primer_apellido";
                $params[':primer_apellido'] = $parametros['primer_apellido'];
            }
            if (isset($parametros['segundo_apellido'])) {
                $set[] = "SEGUNDO_APELLIDO = :segundo_apellido";
                $params[':segundo_apellido'] = $parametros['segundo_apellido'];
            }
            if (isset($parametros['email'])) {
                $set[] = "EMAIL = :email";
                $params[':email'] = $parametros['email'];
            }
            if (isset($parametros['clave'])) {
                // Aplicar hash seguro a la contraseña
                $set[] = "CLAVE = :clave";
                $params[':clave'] = password_hash($parametros['clave'], PASSWORD_DEFAULT);
            }
            if (isset($parametros['tipo_usuario'])) {
                $set[] = "TIPO_USUARIO = :tipo_usuario";
                $params[':tipo_usuario'] = $parametros['tipo_usuario'];
            }
            if (isset($parametros['estado'])) {
                $set[] = "ESTADO = :estado";
                $params[':estado'] = $parametros['estado'];
            }

            if (empty($set)) {
                return ['resultado' => 'ERROR', 'mensaje' => 'No se enviaron campos para actualizar'];
            }

            $sql = "UPDATE usuario SET " . implode(", ", $set) . " WHERE ID_USUARIO = :id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute($params);

            return ['resultado' => 'OK', 'mensaje' => 'Usuario actualizado'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }


    public function filtrarPorId($id)
    {
        try {
            $sql = "SELECT u.ID_USUARIO,tu.TIPO AS TIPO_USUARIO, u.PRIMER_NOMBRE, u.SEGUNDO_NOMBRE,u.PRIMER_APELLIDO,u.SEGUNDO_APELLIDO, u.EMAIL,u.CLAVE, u.ESTADO FROM usuario u INNER JOIN tipo_usuario tu ON u.TIPO_USUARIO =tu.ID_TIPO_USUARIO WHERE ID_USUARIO=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM usuario WHERE id_usuario=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam('id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Usuario eliminado'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function login($email, $clave)
    {
        try {
            $sql = "SELECT u.ID_USUARIO, u.EMAIL, u.CLAVE, c.ID_CLIENTE, u.ESTADO, u.TIPO_USUARIO,c.IDENTIFICACION
                FROM usuario u 
                LEFT JOIN cliente c ON c.USUARIO = u.ID_USUARIO 
                WHERE u.EMAIL = :email";

            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario && password_verify($clave, $usuario['CLAVE'])) {
                unset($usuario['CLAVE']); // no devolvemos la clave
                return [$usuario];
            } else {
                return []; // credenciales inválidas
            }
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }


    }


    public function validarClave($id, $clavePlano)
    {
        try {
            $sql = "SELECT CLAVE FROM usuario WHERE ID_USUARIO = :id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                return ['resultado' => 'ERROR', 'mensaje' => 'Usuario no encontrado'];
            }

            $almacenada = (string) $row['CLAVE'];
            $info = password_get_info($almacenada);
            $esHash = ($info['algo'] !== 0);

            $ok = $esHash
                ? password_verify($clavePlano, $almacenada)
                : hash_equals($almacenada, $clavePlano);

            // 🚨 Debug temporal
            return [
                'debug_id' => $id,
                'debug_clavePlano' => $clavePlano,
                'debug_almacenada' => $almacenada,
                'debug_esHash' => $esHash,
                'resultado' => $ok ? 'OK' : 'ERROR',
                'valido' => $ok
            ];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }



    public function cambiarClave($id, $claveActual, $claveNueva)
    {
        try {
            // Traer clave almacenada
            $stmt = $this->conexion->prepare("SELECT CLAVE FROM usuario WHERE ID_USUARIO = :id");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                return ['resultado' => 'ERROR', 'mensaje' => 'Usuario no encontrado'];
            }

            $almacenada = (string) $row['CLAVE'];
            $info = password_get_info($almacenada);
            $esHash = ($info['algo'] !== 0);

            $ok = $esHash
                ? password_verify($claveActual, $almacenada)
                : hash_equals($almacenada, $claveActual);

            if (!$ok) {
                return ['resultado' => 'ERROR', 'mensaje' => 'La contraseña actual no es correcta'];
            }

            // Actualizar con hash nuevo
            $claveHash = password_hash($claveNueva, PASSWORD_DEFAULT);
            $upd = $this->conexion->prepare("UPDATE usuario SET CLAVE = :clave WHERE ID_USUARIO = :id");
            $upd->bindParam(':clave', $claveHash);
            $upd->bindParam(':id', $id, PDO::PARAM_INT);
            $upd->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Clave actualizada'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }


    // SAUL
    public function cambiarEstadoUsuario($idUsuario)
    {
        try {
            // Consultar estado actual
            $sqlSelect = "SELECT ESTADO FROM usuario WHERE ID_USUARIO = :idUsuario";
            $stmtSelect = $this->conexion->prepare($sqlSelect);
            $stmtSelect->bindParam(':idUsuario', $idUsuario, PDO::PARAM_INT);
            $stmtSelect->execute();
            $estadoActual = $stmtSelect->fetchColumn();

            if ($estadoActual === false) {
                return ['resultado' => 'ERROR', 'mensaje' => 'Usuario no encontrado'];
            }

            // Determinar nuevo estado
            $nuevoEstado = ($estadoActual == 1) ? 0 : 1;

            // Actualizar solo la columna ESTADO
            $sqlUpdate = "UPDATE usuario SET ESTADO = :estado WHERE ID_USUARIO = :idUsuario";
            $stmtUpdate = $this->conexion->prepare($sqlUpdate);
            $stmtUpdate->bindParam(':estado', $nuevoEstado, PDO::PARAM_INT);
            $stmtUpdate->bindParam(':idUsuario', $idUsuario, PDO::PARAM_INT);
            $stmtUpdate->execute();

            $estadoTexto = ($nuevoEstado == 1) ? 'Activo' : 'Inactivo';
            return ['resultado' => 'OK', 'mensaje' => "Estado cambiado a $estadoTexto"];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function actualizarClaveDesdeToken($token, $claveNueva)
{
    // 1. Buscar usuario por token válido
    $sql = "SELECT ID_USUARIO, TOKEN_EXPIRA 
            FROM usuario 
            WHERE TOKEN_RECUPERACION = :token";
    $stmt = $this->conexion->prepare($sql);
    $stmt->execute([':token' => $token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        return ['resultado' => 'ERROR', 'mensaje' => 'Token inválido.'];
    }

    if (strtotime($user['TOKEN_EXPIRA']) < time()) {
        return ['resultado' => 'ERROR', 'mensaje' => 'El enlace expiró.'];
    }

    // 2. Actualizar contraseña
    $claveHash = password_hash($claveNueva, PASSWORD_DEFAULT);

    $upd = $this->conexion->prepare("
        UPDATE usuario SET 
            CLAVE = :clave,
            TOKEN_RECUPERACION = NULL,
            TOKEN_EXPIRA = NULL
        WHERE ID_USUARIO = :id
    ");

    $upd->execute([
        ':clave' => $claveHash,
        ':id' => $user['ID_USUARIO']
    ]);

    return ['resultado' => 'OK', 'mensaje' => 'Contraseña actualizada'];
}


    public function enviarCorreoRecuperacion($email)
    {
        try {
            // 1️⃣ Buscar usuario por correo
            $sql = "SELECT ID_USUARIO, EMAIL, PRIMER_NOMBRE 
                FROM usuario 
                WHERE EMAIL = :email";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute([':email' => $email]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$usuario) {
                return [
                    'resultado' => 'ERROR',
                    'mensaje' => 'El correo no está registrado.'
                ];
            }

            // 2️⃣ Crear token y fecha de expiración
            $token = bin2hex(random_bytes(32)); // 64 chars
            $expira = date('Y-m-d H:i:s', strtotime('+1 hour'));

            // 3️⃣ Guardar token en la BD
            $sql = "UPDATE usuario SET 
                    TOKEN_RECUPERACION = :token,
                    TOKEN_EXPIRA = :expira
                WHERE ID_USUARIO = :id";

            $stmt = $this->conexion->prepare($sql);
            $stmt->execute([
                ':token' => $token,
                ':expira' => $expira,
                ':id' => $usuario['ID_USUARIO']
            ]);

            // 4️⃣ Crear link de recuperación (Angular)
            $link = "http://localhost:4200/acceso/nueva-clave?token={$token}";

            // 5️⃣ Enviar el correo usando PHPMailer y config centralizada
            require_once __DIR__ . '/../library/vendor/autoload.php';
            require_once __DIR__ . '/../library/config-email.php';

            $cfg = get_mail_config();
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);

            $mail->CharSet = 'UTF-8';
            $mail->isSMTP();
            $mail->Host = $cfg['host'];
            $mail->SMTPAuth = true;
            $mail->Username = $cfg['username'];
            $mail->Password = $cfg['password'];
            $mail->SMTPSecure = $cfg['secure'];
            $mail->Port = $cfg['port'];

            $mail->setFrom($cfg['from'], $cfg['from_name']);
            $mail->addAddress($usuario['EMAIL'], $usuario['PRIMER_NOMBRE']);
            $mail->isHTML(true);

            $mail->Subject = "Recuperación de contraseña - Retrofit31";
            $mail->Body = "
            <h2>Hola, {$usuario['PRIMER_NOMBRE']} 👋</h2>
            <p>Solicitaste recuperar tu contraseña en <strong>Retrofit 31</strong>.</p>
            <p>Haz clic en el siguiente botón para continuar:</p>

            <p>
                <a href='{$link}' 
                    style='background:#004D00;color:white;padding:12px 20px;
                    border-radius:6px;text-decoration:none;font-weight:bold'>
                    Crear nueva contraseña
                </a>
            </p>

            <p>Este enlace expirará en 1 hora.</p>
        ";

            $mail->send();

            return [
                'resultado' => 'OK',
                'mensaje' => $cfg['is_sandbox']
                    ? 'Correo simulado enviado a Mailtrap.'
                    : 'Correo enviado correctamente.',
                'sandbox' => $cfg['is_sandbox']
            ];

        } catch (Exception $e) {
            return [
                'resultado' => 'ERROR',
                'mensaje' => $e->getMessage()
            ];
        }
    }









}


?>