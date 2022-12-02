import { Request, Response } from "express";

import { Knex } from "knex";
import { Producto, Usuario } from "../interfaces";
const knex: Knex = require('../db/knex');

export const nuevoProducto = async  (req: Request, res: Response) => {
    try {
        const {nombre, cantidad, precio}: Producto = req.body;

        if(!nombre || !cantidad || !precio ) return res.status(401).json('Faltan valores para poder proceder.');
        const nombreMayuscula = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        const resultado: number[] = await knex('productos').insert({nombre: nombreMayuscula, cantidad, precio, id_usuario: req.usuario?.id});

        res.status(200).json({
            id: resultado[0],
            nombre: nombre,
            cantidad: cantidad,
            precio: precio,
            id_usuario: req.usuario?.id
        })
    } catch (error) {
        res.status(500).json(error)
    }
}

export const listaProductos = async (req: Request, res: Response) => {
    try {
        const listaProductos: Producto[] = await knex('productos').select('*');
        res.status(200).json(listaProductos)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const listaProductosEnVenta = async (req: Request, res: Response) => {
    try {
        const listaProductos: Producto[] = await knex('productos').where('enVenta', 1);
        res.status(200).json(listaProductos)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const productosUsuario = async (req: Request, res: Response) => {
    try {
        const listaProductos: Producto[] = await knex('productos').where('id_usuario', req.params.id_usuario);
        res.status(200).json(listaProductos)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const productoIndividual = async(req: Request, res: Response) => {
    try {
        const producto: Producto = await knex('productos').where('id', req.params.id).first();
        if(!producto) return res.status(401).json('Producto no encontrado.');

        res.status(200).json(producto);
    } catch (error) {
        res.status(500).json(error);
    }
}

export const modificarProducto = async (req: Request, res: Response) => {
    try {
        const { id }: any = req.params;
        
        const comprobacionProducto: Producto = await knex('productos').where('id', id).first();
        if(!comprobacionProducto) return res.status(401).json('No existe el producto demandado.');
        if(req.usuario?.id !== comprobacionProducto.id_usuario) return res.status(401).json('No tienes autorización para modificar este producto.');

        const resultado: number = await knex('productos').where('id', id).update(req.body)
        if(resultado === 0 ) return res.status(401).json('Algo ha ido mal.');

        const productoFinal: Producto = await knex('productos').where('id', id).first();
        res.status(200).json(productoFinal)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const comprarProducto = async(req: Request, res: Response) => {
    try {
        const { cantidad }: {cantidad: number} = req.body;

        const producto = await knex('productos').where('id', req.params.id).first();
        if(!producto) return res.status(401).json('No existe el producto demandado.');
        if(producto.cantidad < cantidad) return res.status(401).json('El vendedor no tiene la cantidad del producto requerida.')
        
        const comprador = await knex('usuarios').where('id', req.usuario?.id).first();
        if(!comprador) return  res.status(401).json('Comprador no encontrado');
        if(comprador?.monedas < producto.precio) return  res.status(401).json('El usuario no tiene monedas suficientes para realizar esta transacción.');

        const vendedor = await knex('usuarios').where('id', producto.id_usuario).first();
        if(!vendedor) return  res.status(401).json('Vendedor no encontrado');

        const cantidadVendedor: number = producto.cantidad - cantidad;
        
        await knex('usuarios').where('id', comprador.id).update({monedas: comprador.monedas - (producto.precio * cantidad)});
        await knex('usuarios').where('id', vendedor.id).update({monedas: vendedor.monedas + (producto.precio * cantidad)});
        
        if(cantidadVendedor > 0) {
            await knex('productos').where('id', producto.id).update({cantidad: cantidadVendedor});
            const objExistente = await knex('productos').where('nombre', producto.nombre).where('id_usuario', comprador.id).first();
            if (objExistente) {
                await knex('productos').where('id', objExistente.id).update({cantidad: objExistente.cantidad + cantidad})
            } else {
                await knex('productos').insert({nombre: producto.nombre, cantidad: cantidad, enVenta: 0, precio: producto.precio, id_usuario: comprador.id})
            }
        } else {
            const objExistente = await knex('productos').where('nombre', producto.nombre).where('id_usuario', comprador.id).first();
            if (objExistente) {
                await knex('productos').where('id', objExistente.id).update({cantidad: objExistente.cantidad + cantidad})
            } else {
                await knex('productos').where('id', producto.id).update({id_usuario: comprador.id, enVenta: 0});
            }
        }

        res.status(200).json('Producto comprado con éxito.')

    } catch (error) {
        res.status(500).json(error)
    }
}

export const eliminarProducto = async (req: Request, res: Response) => {
    try {
        const producto: Producto = await knex('productos').where('id', req.params.id).first();
        if(req.usuario?.id !== producto.id_usuario) return res.status(401).json('No autorizado para borrar este producto.');

        const resultado: number = await knex('productos').where('id', req.params.id).del();

        resultado === 1 ? res.status(200).json('Borrado con éxito.') : res.status(401).json('Algo ha ido mal.');
    } catch (error) {
        res.status(500).json(error)
    }
}

export const borrarTodosLosProductos = async (req: Request, res: Response) => {
    try {
        await knex('productos').del().where('id', '!=', 'null')
        res.status(200).json('Productos borrados.')
    } catch (error) {
        res.status(500).json(error)
    }
}