<?php
require_once '../conexion.php';

class Metodo_de_pagoModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT * FROM metodo_de_pago";
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
            $sql = "INSERT INTO metodo_de_pago (nombre) VALUES (:nombre)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':nombre', $parametros->nombre);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Metodo de pago registrado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM metodo_de_pago WHERE id_metodo_de_pago=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Metodo de pago eliminado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE metodo_de_pago SET nombre=:nombre WHERE id_metodo_de_pago=:id ";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':nombre', $parametros->nombre);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Metodo de pago actualizado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrarPorId($id)
    {
        try {
            $sql = "SELECT * FROM metodo_de_pago WHERE id_metodo_de_pago=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

}


?>