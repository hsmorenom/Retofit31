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
            $sql = "SELECT 
                    e.*, 
                    CONCAT(u.PRIMER_NOMBRE, ' ', u.PRIMER_APELLIDO) AS CREADO_POR
                FROM eventos e
                INNER JOIN usuario u ON e.usuario = u.ID_USUARIO
                ORDER BY e.fecha_actividad DESC";

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

            // Iniciar transacción
            $this->conexion->beginTransaction();

            $sql = "INSERT INTO eventos (NOMBRE_EVENTO,FECHA_ACTIVIDAD, HORA_INICIO, HORA_FIN,INSTRUCTOR,LUGAR_DE_ACTIVIDAD,QR_DE_EVENTO, OBSERVACIONES,USUARIO) VALUES (:nombre_evento,:fecha_actividad,:hora_inicio,:hora_fin,:instructor,:lugar_de_actividad,:qr_de_evento,:observaciones,:usuario)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute([
                ':nombre_evento' => $parametros->NOMBRE_EVENTO,
                ':fecha_actividad' => $parametros->FECHA_ACTIVIDAD,
                ':hora_inicio' => $parametros->HORA_INICIO,
                ':hora_fin' => $parametros->HORA_FIN,
                ':instructor' => $parametros->INSTRUCTOR,
                ':lugar_de_actividad' => $parametros->LUGAR_DE_ACTIVIDAD,
                ':qr_de_evento' => $parametros->QR_DE_EVENTO ?? 'En proceso', //'En proceso' es temporal debido a que se debe configurar el qr
                ':observaciones' => $parametros->OBSERVACIONES ?? null,
                ':usuario' => $parametros->USUARIO

            ]);
            // Fin de la transacción
            $this->conexion->commit();

            return ['resultado' => 'OK', 'mensaje' => 'Evento insertado'];

        } catch (PDOException $e) {
            $this->conexion->rollBack();
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }


    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM eventos WHERE ID_EVENTOS = :id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute([':id' => $id]);

            return ['resultado' => 'OK', 'mensaje' => 'Evento eliminado correctamente'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }


    public function editar($id, $parametros)
    {
        try {

            $sql = "UPDATE eventos 
                SET NOMBRE_EVENTO = :nombre_evento,
                    FECHA_ACTIVIDAD = :fecha_actividad,
                    HORA_INICIO = :hora_inicio,
                    HORA_FIN = :hora_fin,
                    INSTRUCTOR = :instructor,
                    LUGAR_DE_ACTIVIDAD = :lugar_de_actividad,
                    OBSERVACIONES = :observaciones
                WHERE ID_EVENTOS = :id";

            $stmt = $this->conexion->prepare($sql);

            // Parámetros
            $stmt->execute([
                ':id' => $id,
                ':nombre_evento' => $parametros->NOMBRE_EVENTO,
                ':fecha_actividad' => $parametros->FECHA_ACTIVIDAD,
                ':hora_inicio' => $parametros->HORA_INICIO,
                ':hora_fin' => $parametros->HORA_FIN,
                ':instructor' => $parametros->INSTRUCTOR,
                ':lugar_de_actividad' => $parametros->LUGAR_DE_ACTIVIDAD,
                ':observaciones' => $parametros->OBSERVACIONES ?? null,

            ]);

            return ['resultado' => 'OK', 'mensaje' => 'Evento actualizado correctamente'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrar($filtro)
    {
        try {
            // Consulta base
            $sql = "SELECT * FROM eventos WHERE 1=1";
            $params = [];

            // Si hay texto de filtro, buscamos en los campos relevantes
            if (!empty($filtro)) {
                $sql .= " AND (
                nombre_evento LIKE :texto OR
                fecha_actividad LIKE :texto OR
                lugar_de_actividad LIKE :texto OR
                instructor LIKE :texto
            )";
                $params[':texto'] = "%" . $filtro . "%";
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