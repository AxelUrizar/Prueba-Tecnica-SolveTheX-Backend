import { Request, Response } from "express";

import { Knex } from "knex";
import { Token, Usuario } from "../interfaces";
const knex: Knex = require('../db/knex');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export const nuevoUsuario = async (req: Request, res: Response) => {
    try {
        const {nombre, email, contraseña}: Usuario = req.body;
        
        if(!nombre || !contraseña || !email) return res.status(401).json('Faltan valores para poder proceder.');
        if(contraseña.length < 5) return res.status(401).json('La contraseña debe tener almenos 5 valores.');

        const contraseñaEncriptada: string = await bcrypt.hash(contraseña, 8);

        const resultado: number[] = await knex('usuarios').insert({nombre: nombre, email: email, contraseña: contraseñaEncriptada, monedas: 1000});

        res.status(200).json({
            id: resultado[0],
            nombre: nombre,
            email: email,
            monedas: 1000
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const {email, contraseña}: Usuario = req.body;
        
        const usuario: Usuario = await knex('usuarios').where('email', email).first();
        if(!usuario) return res.status(401).json('Email no existente.') 

        const contraseñaDesencriptada: string = await bcrypt.compare(contraseña, usuario.contraseña);
        if(!contraseñaDesencriptada) return res.status(401).json('Contraseña incorrecta.');

        const token = jwt.sign({idUsuario: usuario.id}, process.env.JWT_SECRET);
        await knex('tokens').insert({token: token, id_usuario: usuario.id})

        res.status(200).json({usuario, token});
    } catch (error) {
        res.status(500).json(error)
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        const token: Token = await knex('tokens').where('token', req.token).first();
        if(!token) return res.status(401).json('Token inexistente.');

        await knex('tokens').where('token', req.token).del();
        res.status(200).json('Logout completado.')
    } catch (error) {
        res.status(500).json(error)
    }
}

export const listaUsuarios = async (req: Request, res: Response) => {
    try {
        const listaUsuarios: Usuario[] = await knex('usuarios').select('*');
        res.status(200).json(listaUsuarios);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const perfil = async (req: Request, res: Response) => {
    try {
        const usuario: Usuario = await knex('usuarios').where('id', req.params.id).first();
        usuario ? res.status(200).json(usuario) : res.status(401).json('Usuario no encontrado.')
    } catch (error) {
        res.status(500).json(error);
    }
};

export const editarUsuario = async (req: Request, res: Response) => {
    try {
        if(req.body.contraseña) req.body.contraseña = await bcrypt.hash(req.body.contraseña, 8);
        if(req.body.id || req.body.monedas) return res.status(401).json('No autorizado para modificar esos valores.')
        const resultado = await knex('usuarios').where('id', req.usuario?.id).update(req.body);
        if(resultado === 0) return res.status(401).json('Algo ha ido mal.')
        const usuario: Usuario = await knex('usuarios').where('id', req.usuario?.id).first()
        res.status(200).json(usuario)
    } catch (error) {
        res.status(500).json(error)
    }
};

export const borrarUsuario = async (req: Request, res: Response) => {
    try {
        const resultado: number = await knex('usuarios').where('id', req.usuario?.id).del();

        resultado === 1 ? res.status(200).json('Borrado con éxito.') : res.status(401).json('Algo ha ido mal.')
    } catch (error) {
        res.status(500).json(error)
    }
};

export const borrarTodosLosUsuarios = async (req: Request, res: Response) => {
    try {
        await knex('usuarios').del().where('id', '!=', 'null')
        res.status(200).json('Usuarios borrados.')
    } catch (error) {
        res.status(500).json(error)
    }
}