<?php
require_once '../conexion.php';

class RecordatorioModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT * FROM recordatorio";

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
            $sql = "INSERT INTO recordatorio (CLIENTE, EVENTO, FECHA_HORA, TIPO_NOTIFICACION, FRECUENCIA, ESTADO)VALUES (:cliente,:evento, :fecha_hora, :tipo_notificacion,:frecuencia,:estado);";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':evento', $parametros->evento);
            $stmt->bindParam(':fecha_hora', $parametros->fecha_hora);
            $stmt->bindParam(':tipo_notificacion', $parametros->tipo_notificacion);
            $stmt->bindParam(':frecuencia', $parametros->frecuencia);
            $stmt->bindParam(':estado', $parametros->estado);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Asistencia insertado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM recordatorio WHERE ID_RECORDATORIO = :id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Asistencia eliminada correctamente'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE recordatorio SET CLIENTE=:cliente, EVENTO=:evento,FECHA_HORA=:fecha_hora, TIPO_NOTIFICACION=tipo_notificacion, FRECUENCIA=:frecuencia, ESTADO=:estado WHERE ID_RECORDATORIO=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':evento', $parametros->evento);
            $stmt->bindParam(':fecha_hora', $parametros->fecha_hora);
            $stmt->bindParam(':tipo_notificacion', $parametros->tipo_notificacion);
            $stmt->bindParam(':frecuencia', $parametros->frecuencia);
            $stmt->bindParam(':estado', $parametros->estado);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Asistencia actualizados'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

   


}


?>