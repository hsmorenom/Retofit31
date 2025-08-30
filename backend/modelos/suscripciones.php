<?php
require_once '../conexion.php';

class SuscripcionesModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT * FROM suscripciones";
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
            $sql = "INSERT INTO suscripciones (cliente,plan_suscripcion, fecha_inicio,fecha_vencimiento) VALUES (:cliente,:plan_suscripcion,:fecha_inicio,:fecha_vencimiento)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':plan_suscripcion', $parametros->plan_suscripcion);
            $stmt->bindParam(':fecha_inicio', $parametros->fecha_inicio);
            $stmt->bindParam(':fecha_vencimiento', $parametros->fecha_vencimiento);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Suscripción registrada'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM suscripciones WHERE id_suscripciones=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Suscripción eliminada'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE suscripciones SET cliente=:cliente,plan_suscripcion=:plan_suscripcion, fecha_inicio=:fecha_inicio,fecha_vencimiento =:fecha_vencimiento WHERE id_suscripciones=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':plan_suscripcion', $parametros->plan_suscripcion);
            $stmt->bindParam(':fecha_inicio', $parametros->fecha_inicio);
            $stmt->bindParam(':fecha_vencimiento', $parametros->fecha_vencimiento);

            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Suscripción actualizada'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrarIdCliente($id_cliente)
    {
        try {
            $sql = "SELECT * FROM suscripciones WHERE cliente =:cliente";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':cliente', $id_cliente);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

}


?>