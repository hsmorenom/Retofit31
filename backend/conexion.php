<?php
class DB
{
    public static function conectar()
    {
        try {
            $conexion = new PDO(
                'mysql:host=localhost;port=3306;dbname=retofit31;charset=utf8',
                'root',
                'Schedule0506*'
            );
            $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conexion;
        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }
}

DB::conectar(); // ← Solo para esta prueba
