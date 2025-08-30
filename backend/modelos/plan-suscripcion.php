<?php
require_once '../conexion.php';

class Plan_suscripcionModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT * FROM plan_suscripcion";
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
            $sql = "INSERT INTO plan_suscripcion (nombre_plan,precio,duracion,beneficios) VALUES (:nombre_plan,:precio,:duracion,:beneficios)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':nombre_plan', $parametros->nombre_plan);
            $stmt->bindParam(':precio', $parametros->precio);
            $stmt->bindParam(':duracion', $parametros->duracion);
            $stmt->bindParam(':beneficios', $parametros->beneficios);

            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Plan de suscripción registrado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM plan_suscripcion WHERE id_plan_suscripcion=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Plan de suscripción eliminado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE plan_suscripcion SET nombre_plan=:nombre_plan,precio=:precio,duracion=:duracion,beneficios=:beneficios WHERE id_plan_suscripcion=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':nombre_plan', $parametros->nombre_plan);
            $stmt->bindParam(':precio', $parametros->precio);
            $stmt->bindParam(':duracion', $parametros->duracion);
            $stmt->bindParam(':beneficios', $parametros->beneficios);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Plan de suscripción actualizado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrarPorId($id)
    {
        try {
            $sql = "SELECT * FROM plan_suscripcion WHERE id_plan_suscripcion=:id";
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