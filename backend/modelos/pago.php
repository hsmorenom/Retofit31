<?php
require_once '../conexion.php';

class PagoModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT * FROM pago";
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
            $sql = "INSERT INTO pago (suscripcion,monto,metodo_de_pago) VALUES (:suscripcion,:monto,:metodo_de_pago)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam('suscripcion', $parametros->suscripcion);
            $stmt->bindParam('monto', $parametros->monto);
            $stmt->bindParam('metodo_de_pago', $parametros->metodo_de_pago);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Pago registrado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM pago WHERE id_pago=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Pago eliminado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE pago SET suscripcion=:suscripcion,monto=:monto,metodo_de_pago=:metodo_de_pago WHERE id_pago=:id ";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':suscripcion', $parametros->suscripcion);
            $stmt->bindParam(':monto', $parametros->monto);
            $stmt->bindParam(':metodo_de_pago', $parametros->metodo_de_pago);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Pago actualizado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrarPorId($id)
    {
        try {
            $sql = "SELECT * FROM pago WHERE id_pago=:id";
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