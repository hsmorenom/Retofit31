<?php
require_once '../conexion.php';

class DepartamentoModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT * FROM departamento";
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
            $sql = "INSERT INTO departamento (nombre) VALUES (:nombre)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':nombre', $parametros->nombre);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Departamento guardado'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }


    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM departamento WHERE id_departamento =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Departamento eliminado'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }


    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE departamento SET nombre =:nombre WHERE id_departamento =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam('id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Departamento actualizado'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    public function filtrarPorId($id)
    {
        try {
            $sql = "SELECT * FROM departamento WHERE id_departamento=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }


    }

}



?>