<?php
require_once '../conexion.php';

class AsistenciaModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT * FROM asistencia";
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
            $sql = "INSERT INTO asistencia (cliente,evento,notificacion) VALUES (:cliente,:evento,:notificacion)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':evento', $parametros->evento);
            $stmt->bindParam(':notificacion', $parametros->notificacion);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Asistencia insertado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE asistencia WHERE id_asistencia =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Asistencia eliminado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE asistencia SET cliente=:cliente, qr=:qr, evento=:evento, notificacion=:notificacion WHERE id_asistencia=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':evento', $parametros->evento);
            $stmt->bindParam(':notificacion', $parametros->notificacion);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Asistencia actualizados'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrarIdCliente($id_cliente)
    {
        try {
            $sql = "SELECT * FROM asistencia WHERE cliente = :id_cliente";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id_cliente', $id_cliente);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }


    public function registrarPorQR($id_evento, $id_cliente)
{
    try {
        // Verificar si ya existe asistencia registrada para ese cliente y evento
        $sqlCheck = "SELECT COUNT(*) FROM asistencia WHERE cliente = :cliente AND evento = :evento";
        $stmtCheck = $this->conexion->prepare($sqlCheck);
        $stmtCheck->bindParam(':cliente', $id_cliente);
        $stmtCheck->bindParam(':evento', $id_evento);
        $stmtCheck->execute();

        if ($stmtCheck->fetchColumn() > 0) {
            return ['resultado' => 'DUPLICADO', 'mensaje' => 'Ya se registró la asistencia para este evento.'];
        }

        // Registrar la asistencia nueva
        $sqlInsert = "INSERT INTO asistencia (cliente, evento, notificacion)
                      VALUES (:cliente, :evento, :notificacion)";
        $stmtInsert = $this->conexion->prepare($sqlInsert);
        $notificacion = "Asistencia registrada automáticamente mediante QR.";
        $stmtInsert->bindParam(':cliente', $id_cliente);
        $stmtInsert->bindParam(':evento', $id_evento);
        $stmtInsert->bindParam(':notificacion', $notificacion);
        $stmtInsert->execute();

        return ['resultado' => 'OK', 'mensaje' => 'Asistencia registrada correctamente.'];

    } catch (PDOException $e) {
        return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
    }
}


}


?>