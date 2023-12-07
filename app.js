const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

app.use(express.json());

// Conexión a MongoDB
const uri = "mongodb://localhost:27017";
const cliente = new MongoClient(uri);
const dbNombre = "tareas";
let db, tareas;

async function connectDB() {
    try {
        await cliente.connect();
        console.log("Conectado a MongoDB");
        db = cliente.db(dbNombre);
        tareas = db.collection("tareas");
    } catch (error) {
        console.error("Error al conectar a MongoDB:", error);
    }
}


// Iniciar conexión a la base de datos
connectDB();

// Obtener todas las tareas
app.get('/tareas', async (req, res) => {
    try {
        const todasLasTareas = await tareas.find().toArray();
        res.json(todasLasTareas);
    } catch (error) {
        res.status(400).send('Error al obtener las tareas');
    }
});

// Añadir una nueva tarea
app.post('/tareas', async (req, res) => {
    try {
        const nuevaTarea = req.body;
        await tareas.insertOne(nuevaTarea);
        res.status(201).send('Tarea añadida');
    } catch (error) {
        res.status(400).send('Error al añadir la tarea');
    }
});


// Eliminar una tarea
app.delete('/tareas/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const resultado = await tareas.deleteOne({ _id: id });
        if (resultado.deletedCount === 0) {
            return res.status(404).send('Tarea no encontrada');
        }
        res.send('Tarea eliminada');
    } catch (error) {
        res.status(400).send('Error al eliminar la tarea');
    }
});


// Marcar una tarea como completada
app.put('/tareas/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const resultado = await tareas.updateOne({ _id: id }, { $set: { completada: true } });
        if (resultado.matchedCount === 0) {
            return res.status(404).send('Tarea no encontrada');
        }
        res.send('Tarea actualizada');
    } catch (error) {
        res.status(400).send('Error al actualizar la tarea');
    }
});


app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
