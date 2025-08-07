const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); 
const predictionRoutes = require('./routes/predictionRoutes');
const dataController = require('./controllers/dataController');
const uploadRoutes = require('./routes/uploadRoutes');
const datosPredic = require('./routes/datosPredicRoutes');
const sensorRoutes = require('./routes/sensorRoutes'); // Nueva ruta para sensores
const authRoutes = require('./routes/authRoutes'); // Rutas de autenticación

const app = express();
const PORT = process.env.PORT || 3000;

//Midelwares
app.use(cors());
  
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

//Rutas
app.use('/api/auth', authRoutes); // Rutas de autenticación
app.use('/api/predict', predictionRoutes);
app.use(dataController);
app.use(uploadRoutes);
app.use('/api', datosPredic);
app.use(sensorRoutes); // Rutas para sensores IoT

// Ruta de información del sistema
app.get('/api/info', (req, res) => {
    const { DATABASE_TYPE } = require('./services/databaseService');
    res.json({
        mensaje: 'ICA Predict API',
        version: '2.0.0',
        database: DATABASE_TYPE,
        timestamp: new Date().toISOString()
    });
});

//Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`📊 Modo de base de datos: ${process.env.DATABASE_TYPE || 'local'}`);
});
