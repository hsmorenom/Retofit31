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

}


?>