import express, {Express, NextFunction, Request, Response} from 'express';
import bodyParser from 'body-parser';
import { Usuario } from './interfaces';

const createError = require('http-errors');
const logger = require('morgan');
const cors = require('cors')
const app: Express = express();
require('dotenv').config({ path: __dirname+'/.env' });

const usuariosRouter = require('./routes/usuarios');
const productosRouter = require('./routes/productos');

declare global {
    namespace Express {
        interface Request {
            usuario?: Usuario;
            token?: string;
        }
    }
}

app.use(cors('*'))
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/usuarios', usuariosRouter);
app.use('/productos', productosRouter);

app.get('/', (req: Request, res: Response) => {
    res.status(200).send(':)');
});

// catch 404 and forward to error handler
app.use(function(req: Request, res: Response, next: NextFunction) {
    next(createError(404));
});

// error handler
app.use(function(err: {message: string, status: number}, req: Request, res: Response) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(4000, () => {
    console.log('====================================');
    console.log('Server running on port: 4000');
    console.log('====================================');
});