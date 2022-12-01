export interface Usuario {
    id?: number;
    nombre?: string;
    email?: string;
    contraseña?: string;
    monedas?: number;
};

export interface Producto {
    id?: number;
    nombre?: string;
    cantidad?: number;
    precio?: number;
    enVenta?: number;
    id_usuario?: number;
};

export interface Token {
    id?: number;
    token?: string;
    id_usuario?: string;
}