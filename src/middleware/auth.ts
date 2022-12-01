import { NextFunction, Request, Response } from "express";

import { Knex } from "knex";
const knex: Knex = require('../db/knex');

const jwt = require('jsonwebtoken');

interface Usuario {
    id: number;
    nombre: string;
    email: string;
    contraseña: string;
};

const auth = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        const data = jwt.verify(token, process.env.JWT_SECRET);

        const usuario: Usuario = await knex('usuarios').where('id', data.idUsuario).first()
        if(!usuario) return res.status(401).json({
            middleware: 'auth',
            errMessage: 'User not finded.'
        })

        req.usuario = usuario;
        req.token = token;
        next()
    } catch (error) {
        res.status(500).json({
            middleware: 'auth',
            errMessage: error
        })
    }
}

module.exports = auth