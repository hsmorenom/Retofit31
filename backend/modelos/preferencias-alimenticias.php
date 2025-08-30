<?php
require_once '../conexion.php';

class Preferencias_alimenticiasModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    // consultar 
    public function consultar()
    {
        try {
            $sql = "SELECT * FROM preferencias_alimenticias";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    // insertar por parametros
    public function insertar($parametros)
    {
        try {
            $sql = "INSERT INTO preferencias_alimenticias (nombre, plan_alimenticio) VALUES (:nombre,:plan_alimenticio)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':nombre', $parametros->nombre);
            $stmt->bindParam(':plan_alimenticio', $parametros->plan_alimenticio);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Preferencias alimenticias guardado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }
    // eliminar por id
    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM preferencias_alimenticias WHERE id_preferencias_alimenticias =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Prefencia alimenticia eliminado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    // editar parametros segun id
    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE preferencias_alimenticias SET nombre=:nombre, plan_alimenticio=:plan_alimenticio WHERE id_preferencias_alimenticias =:id ";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':nombre', $parametros->nombre);
            $stmt->bindParam(':plan_alimenticio', $parametros->plan_alimenticio);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Preferencia alimenticia actualizado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    // filtrar por cliente
    public function filtrarIdCliente($id_cliente)
    {
        try {
            $sql = "SELECT pa.* FROM preferencias_alimenticias pa JOIN plan_alimenticio pla ON pa.plan_alimenticio = pla.id_plan_alimenticio JOIN fotografia f ON pla.fotografia = f.id_fotografia JOIN cliente c ON f.cliente = c.id_cliente WHERE c.id_cliente = :id_cliente";
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