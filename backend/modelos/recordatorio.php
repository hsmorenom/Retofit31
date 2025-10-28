<?php
require_once '../conexion.php';

class RecordatorioModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT 
                    r.*, 
                    e.NOMBRE_EVENTO,
                    e.LUGAR_DE_ACTIVIDAD,
                    u.EMAIL,
                    c.TELEFONO,
                    CONCAT(u.PRIMER_NOMBRE, ' ', u.PRIMER_APELLIDO) AS NOMBRE_CLIENTE
                FROM recordatorio r
                INNER JOIN cliente c ON r.CLIENTE = c.ID_CLIENTE
                INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO
                INNER JOIN eventos e ON r.EVENTO = e.ID_EVENTOS
                WHERE r.FECHA_HORA < NOW()
                ORDER BY r.FECHA_HORA DESC";

            $stmt = $this->conexion->prepare($sql);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function consultarVigencia()
    {
        try {
            $sql = "SELECT 
                    r.ID_RECORDATORIO,
                    r.FECHA_HORA,
                    r.TIPO_NOTIFICACION,
                    r.FRECUENCIA,
                    r.ESTADO,
                    u.EMAIL, 
                    C.TELEFONO,
                    CONCAT(u.PRIMER_NOMBRE, ' ', 
                           IFNULL(u.SEGUNDO_NOMBRE, ''), ' ', 
                           u.PRIMER_APELLIDO, ' ', 
                           IFNULL(u.SEGUNDO_APELLIDO, '')) AS NOMBRE_CLIENTE,
                    c.IDENTIFICACION AS DOCUMENTO_CLIENTE,
                    e.NOMBRE_EVENTO,
                    e.FECHA_ACTIVIDAD,
                    e.LUGAR_DE_ACTIVIDAD
                FROM recordatorio r
                INNER JOIN cliente c ON r.CLIENTE = c.ID_CLIENTE
                INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO
                INNER JOIN eventos e ON r.EVENTO = e.ID_EVENTOS
                WHERE r.FECHA_HORA >= NOW()  -- 🔹 Solo los recordatorios futuros o del momento actual
                ORDER BY r.FECHA_HORA ASC";  //-- 🔹 //Los más próximos primero

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
        // 🧩 Convertir a arreglo (soporta múltiples clientes o uno solo)
        $clientes = is_array($parametros->cliente) ? $parametros->cliente : [$parametros->cliente];
        $insertados = 0;

        // 🧩 Obtener datos del evento
        $verificarEvento = $this->conexion->prepare("
            SELECT FECHA_ACTIVIDAD, HORA_INICIO 
            FROM eventos 
            WHERE ID_EVENTOS = :evento
        ");
        $verificarEvento->execute([':evento' => $parametros->evento]);
        $evento = $verificarEvento->fetch(PDO::FETCH_ASSOC);

        if (!$evento) {
            return ['resultado' => 'ERROR', 'mensaje' => 'El evento no existe.'];
        }

        // 🕒 Calcular fecha y hora del recordatorio (1 día antes del evento)
        $fechaCompletaEvento = new DateTime($evento['FECHA_ACTIVIDAD'] . ' ' . $evento['HORA_INICIO']);
        $fechaCompletaEvento->modify('-24 hours');
        $fechaRecordatorio = $fechaCompletaEvento->format('Y-m-d H:i:s');

        // 🔁 Insertar para cada cliente válido (tipo 4)
        foreach ($clientes as $clienteId) {
            $verificar = $this->conexion->prepare("
                SELECT u.TIPO_USUARIO 
                FROM cliente c 
                INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO 
                WHERE c.ID_CLIENTE = :cliente
            ");
            $verificar->execute([':cliente' => $clienteId]);
            $tipoUsuario = $verificar->fetchColumn();

            if (!$tipoUsuario || (int) $tipoUsuario !== 4) {
                continue; // Saltar si no es cliente tipo 4
            }

            // 🧩 Normalizar estado
            $estado = strtolower(trim($parametros->estado ?? 'pendiente'));
            $valoresValidos = ['pendiente', 'enviado', 'cancelado'];
            if (!in_array($estado, $valoresValidos)) {
                $estado = 'pendiente';
            }

            // ✅ Insertar el recordatorio
            $sql = "INSERT INTO recordatorio 
                (CLIENTE, EVENTO, FECHA_HORA, TIPO_NOTIFICACION, FRECUENCIA, ESTADO)
                VALUES (:cliente, :evento, :fecha_hora, :tipo_notificacion, :frecuencia, :estado)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute([
                ':cliente' => $clienteId,
                ':evento' => $parametros->evento,
                ':fecha_hora' => $fechaRecordatorio,
                ':tipo_notificacion' => strtolower(trim($parametros->tipo_notificacion ?? 'correo')),
                ':frecuencia' => strtolower(trim($parametros->frecuencia ?? '1_dia')),
                ':estado' => $estado
            ]);

            $insertados++;
        }

        if ($insertados === 0) {
            return [
                'resultado' => 'ERROR',
                'mensaje' => 'No se pudo programar ningún recordatorio (clientes no válidos).'
            ];
        }

        return [
            'resultado' => 'OK',
            'mensaje' => "Recordatorios programados para $insertados cliente(s)."
        ];

    } catch (PDOException $e) {
        return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
    }
}




    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM recordatorio WHERE ID_RECORDATORIO = :id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Recordatorio eliminado correctamente'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE recordatorio SET CLIENTE=:cliente, EVENTO=:evento,FECHA_HORA=:fecha_hora, TIPO_NOTIFICACION=tipo_notificacion, FRECUENCIA=:frecuencia, ESTADO=:estado WHERE ID_RECORDATORIO=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':evento', $parametros->evento);
            $stmt->bindParam(':fecha_hora', $parametros->fecha_hora);
            $stmt->bindParam(':tipo_notificacion', $parametros->tipo_notificacion);
            $stmt->bindParam(':frecuencia', $parametros->frecuencia);
            $stmt->bindParam(':estado', $parametros->estado);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Recordatorio actualizado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

   public function actualizarEstado($id, $estado)
{
    try {
        // Limpieza extra de saltos de línea o espacios
        $estado = strtolower(trim(preg_replace('/\s+/', '', $estado)));
        $permitidos = ['pendiente', 'enviado', 'cancelado'];

        if (!in_array($estado, $permitidos)) {
            return ['resultado' => 'ERROR', 'mensaje' => "Estado no válido: '{$estado}'"];
        }

        $sql = "UPDATE recordatorio SET ESTADO = :estado WHERE ID_RECORDATORIO = :id";
        $stmt = $this->conexion->prepare($sql);
        $stmt->bindParam(':estado', $estado);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        return ['resultado' => 'OK', 'mensaje' => 'Estado actualizado correctamente.'];
    } catch (PDOException $e) {
        return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
    }
}







}


?>