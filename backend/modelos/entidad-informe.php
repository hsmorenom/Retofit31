<?php
require_once '../conexion.php';

class Entidad_informeModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT * FROM entidad_informe";
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
            $sql = "INSERT INTO entidad_informe (INFORME,ENTIDAD,ID_REFERENCIA) VALUES (:informe,:entidad,:id_referencia)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':informe', $parametros->INFORME);
            $stmt->bindParam(':entidad', $parametros->ENTIDAD);
            $stmt->bindParam(':id_referencia', $parametros->ID_REFERENCIA);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Entidad Informe registrado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM entidad_informe WHERE id_entidad_informe=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Entidad Informe eliminado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE entidad_informe SET informe=:informe,entidad=:entidad,id_referencia=:id_referencia WHERE id_entidad_informe=:id ";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':informe', $parametros->informe);
            $stmt->bindParam(':entidad', $parametros->entidad);
            $stmt->bindParam(':id_referencia', $parametros->id_referencia);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Entidad Informe actualizado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrarPorId($id)
    {
        try {
            $sql = "SELECT * FROM entidad_informe WHERE id_entidad_informe=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrarPorEntidad($entidad, $id_Referencia)
    {
        try {
            $sql = "SELECT * FROM entidad_informe WHERE entidad = :entidad AND id_referencia = :id_Referencia";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':entidad', $entidad);
            $stmt->bindParam(':id_Referencia', $id_Referencia);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

}


?>