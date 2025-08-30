<?php
require_once '../conexion.php';

class CiudadModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT ID_CIUDAD, NOMBRE, DEPARTAMENTO  FROM ciudad";
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
            $sql = "INSERT INTO ciudad (nombre, id_departamento) VALUES (:nombre,:id_departamento)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':nombre', $parametros->nombre);
            $stmt->bindParam(':id_departamento', $parametros->id_departamento);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'ciudad guardada'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM ciudad WHERE id_ciudad =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Ciudad eliminada'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    public function editar($id, $parametros)
    {
        try {
            $set = [];
            $params = [':id' => $id];

            if (isset($parametros['nombre'])) {
                $set[] = "NOMBRE = :nombre";
                $params[':nombre'] = $parametros['nombre'];
            }

            if (isset($parametros['departamento'])) {
                $set[] = "DEPARTAMENTO = :departamento";
                $params[':departamento'] = $parametros['departamento'];
            }

            if (empty($set)) {
                return ['resultado' => 'ERROR', 'mensaje' => 'No se enviaron campos para actualizar'];
            }

            $sql = "UPDATE ciudad SET " . implode(", ", $set) . " WHERE ID_CIUDAD = :id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute($params);


            return ['resultado' => 'OK', 'mensaje' => 'Ciudad actualizada'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    public function filtrarPorId($id)
    {
        try {
            $sql = "SELECT * FROM ciudad WHERE id_ciudad LIKE :id";
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