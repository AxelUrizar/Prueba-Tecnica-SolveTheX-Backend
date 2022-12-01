import express from 'express'
const router = express.Router();

const auth = require('../middleware/auth')

import { borrarTodosLosProductos, comprarProducto, eliminarProducto, listaProductos, listaProductosEnVenta, modificarProducto, nuevoProducto, productoIndividual, productosUsuario } from '../controllers/productosControllers';

router.post('/crearProducto', auth, nuevoProducto);

router.get('/listaProductos', listaProductos);

router.get('/listaProductosEnVenta', listaProductosEnVenta);

router.get('/listaProductos/:id_usuario', productosUsuario);

router.get('/detallesProducto/:id', productoIndividual);

router.put('/modificarProducto/:id', auth, modificarProducto);

router.put('/comprarProducto/:id', auth, comprarProducto);

router.delete('/borrarProducto/:id', auth,  eliminarProducto)

router.delete('/borrarTodosLosProductos', borrarTodosLosProductos);

module.exports = router;