<?php
require_once '../conexion.php';

class ObjetivosModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT * FROM objetivos";
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
            $sql = "INSERT INTO objetivos (nombre, plan_alimenticio) VALUES (:nombre,:plan_alimenticio)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':nombre', $parametros->nombre);
            $stmt->bindParam(':plan_alimenticio', $parametros->plan_alimenticio);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Objetivos guardado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE objetivos WHERE id_objetivos=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Objetivo eliminado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($parametros, $id)
    {
        try {
            $sql = "UPDATE objetivos SET nombre=:nombre, plan_alimenticio=:plan_alimenticio WHERE id_objetivos=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam('id', $id);
            $stmt->bindParam(':nombre', $parametros->nombre);
            $stmt->bindParam(':plan_alimenticio', $parametros->plan_alimenticio);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Objetivo actualizado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrarIdCliente($id_cliente)
    {
        try {
            $sql = "SELECT ob.* FROM objetivos ob JOIN plan_alimenticio pla ON ob.plan_alimenticio = pla.id_plan_alimenticio JOIN fotografia f ON pla.fotografia = f.id_fotografia JOIN cliente c ON f.cliente = c.id_cliente WHERE c.id_cliente = :id_cliente";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id_cliente', $id_cliente);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

}


?>