<?php
require_once '../conexion.php';

class Restricciones_alimenticiasModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT * FROM restricciones_alimenticias";
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
            $sql = "INSERT INTO restricciones_alimenticias (nombre,plan_alimenticio) VALUES (:nombre,:plan_alimenticio )";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':nombre', $parametros->nombre);
            $stmt->bindParam(':plan_alimenticio', $parametros->plan_alimenticio);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Restricciones alimenticias guardado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE restricciones_alimenticias WHERE id_restricciones_alimenticias =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Prefencia alimenticia eliminado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE restricciones_alimenticias SET nombre=:nombre , plan_alimenticio=:plan_alimenticio  WHERE id_restricciones_alimenticias=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':nombre', $parametros->nombre);
            $stmt->bindParam(':plan_alimenticio', $parametros->plan_alimenticio);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Restricciones alimenticias actualizado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrarIdCliente($id_cliente)
    {
        try {
            $sql = "SELECT ra.* FROM restricciones_alimenticias ra JOIN plan_alimenticio pla ON ra.plan_alimenticio = pla.id_plan_alimenticio JOIN fotografia f ON pla.fotografia = f.id_fotografia JOIN cliente c ON f.cliente = c.id_cliente WHERE c.id_cliente = :id_cliente";
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