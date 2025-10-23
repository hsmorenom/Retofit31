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
            $fechaCompletaEvento->modify('-24 hours'); // exactamente 1 día antes
            $fechaRecordatorio = $fechaCompletaEvento->format('Y-m-d H:i:s');

            // 🔁 Insertar para cada cliente
            foreach ($clientes as $clienteId) {

                // 🧩 Validar que el cliente sea tipo 4
                $verificar = $this->conexion->prepare("
                SELECT u.TIPO_USUARIO 
                FROM cliente c 
                INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO 
                WHERE c.ID_CLIENTE = :cliente
            ");
                $verificar->execute([':cliente' => $clienteId]);
                $tipoUsuario = $verificar->fetchColumn();

                if (!$tipoUsuario || (int) $tipoUsuario !== 4) {
                    // Saltar si no es cliente válido
                    continue;
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
                    ':tipo_notificacion' => $parametros->tipo_notificacion,
                    ':frecuencia' => $parametros->frecuencia,
                    ':estado' => $parametros->estado ?? 'pendiente'
                ]);

                $insertados++;
            }

            if ($insertados === 0) {
                return ['resultado' => 'ERROR', 'mensaje' => 'No se pudo programar ningún recordatorio (clientes no válidos).'];
            }

            return ['resultado' => 'OK', 'mensaje' => "Recordatorios programados para $insertados cliente(s)."];

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




}


?>