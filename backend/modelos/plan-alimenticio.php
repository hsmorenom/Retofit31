<?php
require_once '../conexion.php';

class Plan_alimenticioModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    //consulta general
    public function consultar()
    {
        try {
            $sql = "SELECT * FROM plan_alimenticio";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }



    //insertar

    public function insertar($parametros)
    {
        try {
            $sql = "INSERT INTO plan_alimenticio (fotografia,usuario) VALUES (:fotografia,:usuario )";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':fotografia', $parametros->fotografia->cliente);
            $stmt->bindParam(':usuario', $parametros->usuario);

            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Plan alimenticio guardado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM plan_alimenticio WHERE id_plan_alimenticio =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Plan alimenticio eliminado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE plan_alimenticio SET fotografia =:fotografia, usuario=:usuario WHERE id_plan_alimenticio=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':fotografia', $parametros->fotografia);
            $stmt->bindParam(':usuario', $parametros->usuario);

            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Plan alimenticio actualizado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    //filtrar por cliente
    public function filtrarIdCliente($id)
    {
        try {
            $sql = "SELECT 
                    pa.id_plan_alimenticio,
                    pa.fotografia AS id_fotografia,
                    pa.usuario AS id_usuario
                    -- ,c.id_cliente
                FROM plan_alimenticio pa
                INNER JOIN fotografia f ON pa.fotografia = f.id_fotografia
                INNER JOIN cliente c ON f.cliente = c.id_cliente
                WHERE c.id_cliente = :id";
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