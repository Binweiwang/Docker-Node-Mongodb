import express from 'express';
import {mongoose, Schema} from 'mongoose';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(express.json());
const allowedOrigins = ['http://localhost:' + port, 'http://localhost:5500', 'http://localhost:8080', 'http://127.0.0.1:5500'];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
};

app.use(cors(corsOptions));

mongoose.connect('mongodb://mongo-db:27017/tareas');
const db = mongoose.connection;

const tareaSchema = new Schema({
    _id: Schema.Types.ObjectId,
    titulo: String,
    description: String,
    completada: Boolean
})

const Tarea = mongoose.model('Tarea', tareaSchema);

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
    console.log('Conexión exitosa a MongoDB');
});

// Obtener todas las tareas
app.get('/tareas', async (req, res) => {
    try {
        res.send(await Tarea.find());
    } catch (error) {
        res.status(400).send('Error al obtener las tareas');
    }
});

// Obtener una tarea por id
app.get('/tareas/:id',async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`ID ${req.params.id} de tarea inválido`);
    }
    const tarea = await Tarea.findById(req.params.id);
    if (!tarea) return res.status(404).send(`La tarea con el ID: ${req.params.id} especificado no existe`);
    res.send(tarea);
});

// Crear una tarea
app.post('/tareas', async (req, res) => {
    const {titulo, description} = req.body;
    if (!titulo || !description) {
        return res.status(400).send('Faltan datos para crear la tarea');
    }
    const tarea = await Tarea.create({
        _id: new mongoose.Types.ObjectId(),
        titulo,
        description,
        completada:false
    });
    res.status(201).send(tarea);
});
// Actualizar una tarea
app.put('/tareas/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`ID ${req.params.id} de tarea inválido`);
    }
    const {titulo, description, completada} = req.body;
    if (!titulo || !description || typeof completada !== 'boolean') {
        return res.status(400).send('Faltan datos para actualizar la tarea');
    }
    const tarea = await Tarea.findByIdAndUpdate(req.params.id, {
        titulo,
        description,
        completada
    });
    if (!tarea) return res.status(404).send(`La tarea con el ID: ${req.params.id} especificado no existe`);
    res.send(req.body);
});

// Eliminar una tarea
app.delete('/tareas/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`ID ${req.params.id} de tarea inválido`);
    }
    const tarea = await Tarea.findByIdAndDelete(req.params.id);
    if (!tarea) return res.status(404).send(`La tarea con el ID: ${req.params.id} especificado no existe`);
    res.send(tarea);
});

// Controlador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(400).send('Algo salió mal');
});
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
