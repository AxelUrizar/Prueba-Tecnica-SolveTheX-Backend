import { borrarTodosLosUsuarios, borrarUsuario, editarUsuario, listaUsuarios, login, logout, nuevoUsuario, perfil } from "../controllers/usuariosControllers";

import express from 'express'
const router = express.Router();

const auth = require('../middleware/auth')

router.post('/signUp', nuevoUsuario);

router.post('/login', login);

router.delete('/logout', auth, logout);

router.get('/listaUsuarios', listaUsuarios);

router.get('/perfil/:id', perfil);

router.put('/editarUsuario', auth, editarUsuario);

router.delete('/borrarUsuario', auth, borrarUsuario); 

router.delete('/borrarTodo', borrarTodosLosUsuarios);

module.exports = router;