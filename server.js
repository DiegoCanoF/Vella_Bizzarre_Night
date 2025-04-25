const express = require('express');
const { Pool } = require('pg');  // Importar Pool desde 'pg'
const path = require('path');
const cors = require('cors');  // Importa CORS

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a PostgreSQL usando el URL externo proporcionado por Render
const pool = new Pool({
    user: 'diego',
    host: 'dpg-d05g2t6uk2gs73ce4ot0-a.oregon-postgres.render.com',
    database: 'vella',
    password: 'ozO8L34XgKPVotTTZFCxWAIVRymAsn81',
    port: 5432,
    ssl: { rejectUnauthorized: false }, // Agregar esta línea para SSL
  });

// Conexión exitosa (opcional)
pool.connect((err) => {
  if (err) {
    console.error('Error al conectar a PostgreSQL:', err.stack);
  } else {
    console.log('Conectado a PostgreSQL');
  }
});

// Middleware para archivos estáticos y JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());  // Habilita CORS

// Ruta para obtener todos los personajes
app.get('/api/personajes', (req, res) => {
  const query = 'SELECT id, personaje, nombre, imagen FROM personajes';
  pool.query(query, (err, result) => {  // Usar pool.query en lugar de db.query
    if (err) {
      console.error('Error al obtener personajes:', err);
      return res.status(500).json({ error: 'Error al obtener personajes' });
    }
    console.log('Personajes obtenidos:', result.rows);
    res.json(result.rows);
  });
});

// Ruta para asignar un nombre a un personaje (una sola vez)
app.post('/api/asignar', (req, res) => {
  const { id, nombre } = req.body;

  if (!id || !nombre) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  // Verifica si el personaje ya tiene un nombre asignado
  pool.query('SELECT nombre FROM personajes WHERE id = $1', [id], (err, result) => {  // Usar pool.query en lugar de db.query
    if (err) {
      console.error('Error al verificar personaje:', err);
      return res.status(500).json({ error: 'Error al verificar personaje' });
    }

    if (result.rows.length > 0 && result.rows[0].nombre) {
      return res.status(403).json({ error: 'Este personaje ya fue asignado' });
    }

    // Actualiza el nombre del personaje
    pool.query('UPDATE personajes SET nombre = $1 WHERE id = $2', [nombre, id], (err) => {  // Usar pool.query en lugar de db.query
      if (err) {
        console.error('Error al asignar nombre:', err);
        return res.status(500).json({ error: 'Error al asignar nombre' });
      }
      console.log(`Nombre asignado al personaje ID ${id}: ${nombre}`);
      res.json({ success: true });
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
