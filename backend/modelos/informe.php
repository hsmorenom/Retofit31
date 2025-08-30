<?php
require_once '../conexion.php';

class InformeModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT * FROM informe";
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
            $sql = "INSERT INTO informe (fecha_creacion,tipo_informe,usuario,cliente) VALUES (:fecha_creacion,:tipo_informe,:usuario,:cliente)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':fecha_creacion', $parametros->fecha_creacion);
            $stmt->bindParam(':tipo_informe', $parametros->tipo_informe);
            $stmt->bindParam(':usuario', $parametros->usuario);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Informe registrado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM informe WHERE id_informe=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Informe eliminado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE informe SET fecha_creacion=:fecha_creacion,tipo_informe=:tipo_informe,usuario=:usuario,cliente=:cliente WHERE id_informe=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam('fecha_creacion', $parametros->fecha_creacion);
            $stmt->bindParam('tipo_informe', $parametros->tipo_informe);
            $stmt->bindParam('usuario', $parametros->usuario);
            $stmt->bindParam('cliente', $parametros->cliente);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Informe actualizado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrar($filtros)
    {
        try {
            $sql = "SELECT * FROM informe WHERE 1=1";
            $params = [];

            if (!empty($filtros->id)) {
                $sql .= " AND id_informe = :id";
                $params[':id'] = $filtros->id;
            }

            if (!empty($filtros->fecha_creacion)) {
                $sql .= " AND fecha_creacion = :fecha_creacion";
                $params[':fecha_creacion'] = $filtros->fecha_creacion;
            }

            if (!empty($filtros->tipo_informe)) {
                $sql .= " AND tipo_informe LIKE :tipo_informe";
                $params[':tipo_informe'] = '%' . $filtros->tipo_informe . '%';
            }

            if (!empty($filtros->usuario)) {
                $sql .= " AND usuario = :usuario";
                $params[':usuario'] = $filtros->usuario;
            }

            if (!empty($filtros->cliente)) {
                $sql .= " AND cliente = :cliente";
                $params[':cliente'] = $filtros->cliente;
            }

            $stmt = $this->conexion->prepare($sql);
            $stmt->execute($params);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

}


?>