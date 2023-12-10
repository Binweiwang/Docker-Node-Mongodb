db = db.getSiblingDB('tareas');
db.createCollection('tareas');

db.tareas.insertMany([
    {
        _id: ObjectId(),
        titulo: "Tarea 1",
        description: "Esta es la tarea 1",
        completada: false
    }]);