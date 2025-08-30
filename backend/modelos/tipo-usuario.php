<?php
require_once '../conexion.php';

class Tipo_usuarioModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT ID_TIPO_USUARIO, TIPO FROM tipo_usuario";
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
            $sql = "INSERT INTO tipo_usuario (nombre) VALUES (:nombre)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':nombre', $parametros->nombre);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Tipo de usuario guardado'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM tipo_usuario WHERE id_tipo_usuario =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Tipo de usuario eliminado'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE tipo_usuario SET nombre = :nombre WHERE id_tipo_usuario =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':nombre', $parametros->nombre);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Tipo de usuario actualizado'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    public function filtrarPorId($id)
    {
        try {
            $sql = "SELECT * FROM tipo_usuario WHERE id_tipo_usuario LIKE :id";
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