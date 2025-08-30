<?php
require_once '../conexion.php';

class FotografiaModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT * FROM fotografia";
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
            $sql = "INSERT INTO fotografia (fecha_inicio,fecha_final,imagen_url,cliente,usuario) VALUES(:fecha_inicio,:fecha_final,:imagen_url,:cliente,:usuario)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':fecha_inicio', $parametros->fecha_inicio);
            $stmt->bindParam(':fecha_final', $parametros->fecha_final);
            $stmt->bindParam(':imagen_url', $parametros->imagen_url);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':usuario', $parametros->usuario);
            $stmt->execute();


            return ['resultado' => 'OK', 'mensaje' => 'ciudad guardada'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM fotografia WHERE id_fotografia =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Fotografía eliminada'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE fotografia SET fecha_inicio=:fecha_inicio, fecha_final=:fecha_final,imagen_url=:imagen_url,cliente=:cliente,usuario=:usuario WHERE id_fotografia =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':fecha_inicio', $parametros->fecha_inicio);
            $stmt->bindParam(':fecha_final', $parametros->fecha_final);
            $stmt->bindParam(':imagen_url', $parametros->imagen_url);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':usuario', $parametros->usuario);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Fotografía editada'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    //filtrar por cliente
    public function filtrar($idCliente)
    {
        try {
            $sql = "SELECT * FROM fotografia WHERE cliente =:cliente";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':cliente', $idCliente);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }


    }






}


?>