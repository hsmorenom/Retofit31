<?php
require_once '../conexion.php';

class EventosModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT *  FROM eventos";
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
            $sql = "INSERT INTO eventos (nombre_evento,fecha_actividad, hora_inicio, hora_fin,duracion,lugar_de_actividad,observaciones,usuario) VALUES (:nombre_evento,:fecha_actividad,:hora_inicio,:hora_fin,:duracion,:lugar_de_actividad,:observaciones,:usuario)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':nombre_evento', $parametros->nombre_evento);
            $stmt->bindParam(':fecha_actividad', $parametros->fecha_actividad);
            $stmt->bindParam(':hora_inicio', $parametros->hora_inicio);
            $stmt->bindParam(':hora_fin', $parametros->hora_fin);
            $stmt->bindParam(':duracion', $parametros->duracion);
            $stmt->bindParam(':lugar_de_actividad', $parametros->lugar_de_actividad);
            $stmt->bindParam(':observaciones', $parametros->observaciones);
            $stmt->bindParam(':usuario', $parametros->usuario);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Evento insertado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM eventos WHERE id_eventos =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Evento eliminado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE eventos SET nombre_evento=:nombre_evento,fecha_actividad=:fecha_actividad, hora_inicio=:hora_inicio, hora_fin=:hora_fin,duracion=:duracion,lugar_de_actividad=:lugar_de_actividad,observaciones=:observaciones,usuario=:usuario WHERE id_eventos=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':nombre_evento', $parametros->nombre_evento);
            $stmt->bindParam(':fecha_actividad', $parametros->fecha_actividad);
            $stmt->bindParam(':hora_inicio', $parametros->hora_inicio);
            $stmt->bindParam(':hora_fin', $parametros->hora_fin);
            $stmt->bindParam(':duracion', $parametros->duracion);
            $stmt->bindParam(':lugar_de_actividad', $parametros->lugar_de_actividad);
            $stmt->bindParam(':observaciones', $parametros->observaciones);
            $stmt->bindParam(':usuario', $parametros->usuario);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Evento actualizado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrar($filtros)
    {
        try {
            $sql = "SELECT * FROM eventos WHERE 1=1";
            $params = [];

            if (!empty($filtros->id_eventos)) {
                $sql .= " AND id_eventos= :id";
                $params[':id'] = $filtros->id_eventos;
            }

            if (!empty($filtros->nombre_evento)) {
                $sql .= " AND nombre_evento LIKE :nombre_evento";
                $params[':nombre_evento'] = "%" . $filtros->nombre_evento . "%";
            }

            if (!empty($filtros->fecha_actividad)) {
                $sql .= " AND fecha_actividad = :fecha_actividad";
                $params[':fecha_actividad'] = $filtros->fecha_actividad;
            }

            if (!empty($filtros->usuario)) {
                $sql .= " AND usuario = :usuario";
                $params[':usuario'] = $filtros->usuario;
            }

            if (!empty($filtros->lugar_de_actividad)) {
                $sql .= " AND lugar_de_actividad LIKE :lugar";
                $params[':lugar'] = "%" . $filtros->lugar_de_actividad . "%";
            }

            if (!empty($filtros->observaciones)) {
                $sql .= " AND observaciones LIKE :observaciones";
                $params[':observaciones'] = "%" . $filtros->observaciones . "%";
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