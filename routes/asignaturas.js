const express = require('express');
const router = express.Router();
const Asignatura = require('../models/asignatura'); // Corregí el nombre del modelo
const Estudio = require('../models/estudio'); // Modelo de estudios


// Middleware isAuthenticated definido directamente aquí
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { // Verifica si el usuario está autenticado
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};

// Ruta para mostrar todas las asignaturas
router.get('/asignaturas', isAuthenticated, async (req, res) => {
  try {
    const asignaturas = await Asignatura.find(); // Obtener todos las asignaturas
    res.render('asignaturas', { user: req.user, asignaturas, messages: req.flash() });
  } catch (error) {
    console.error('Error obteniendo las asignaturas:', error);
    res.status(500).send('Error al cargar las asignaturas');
  }
});

// Ruta para mostrar el formulario de creación de asignaturas con los estudios
router.get('/signupAsignatura', isAuthenticated, async (req, res) => {
  try {
    const estudios = await Estudio.find(); // Obtener todos los estudios
    res.render('signupAsignatura', { estudios, messages: req.flash() });
  } catch (error) {
    console.error('Error obteniendo los estudios en  formulario de creación de asignaturas:', error);
    res.status(500).send('Error al cargar los estudios en formulario de creación de asignaturas');
  }
});

// Ruta para procesar el formulario de creación de asignaturas
router.post('/signupAsignatura', isAuthenticated, async (req, res) => {
  const { nombre, curso, estudio_id } = req.body;

  try {
    // Crea una nueva asignatura
    const nuevaAsignatura = new Asignatura({
      nombre,
      curso,
      estudio_id,
    });

    // Guarda la asignatura en la base de datos
    await nuevaAsignatura.save();
    req.flash('signupMessage', 'Asignatura Creada.'); // Guarda el mensaje flash
    return res.redirect('/signupAsignatura'); // Redirige a la misma página
  } catch (error) {
    console.error('Error al crear la asignatura:', error);
    res.status(500).send('Error al crear la asignatura. Por favor, inténtalo de nuevo.');
  }
});

// Ruta para listar todas las asignaturas del usuario
router.get('/asignaturas', isAuthenticated, async (req, res) => {
  try {
    // Busca las asignaturas del usuario autenticado
    const asignaturas = await Asignatura.find({ usuario: req.user._id });

    // Renderiza la vista con las asignaturas
    res.render('asignaturas', { asignaturas });
  } catch (error) {
    console.error('Error al obtener las asignaturas:', error);
    res.status(500).send('Error al obtener las asignaturas. Por favor, inténtalo de nuevo.');
  }
});

// Ruta para eliminar una asignatura
router.get('/asignaturas/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Elimina la asignatura por su ID
    await Asignatura.deleteOne({ _id: id });

    // Redirige al usuario a la lista de asignaturas
    res.redirect('/asignaturas');
  } catch (error) {
    console.error('Error al eliminar la asignatura:', error);
    res.status(500).send('Error al eliminar la asignatura. Por favor, inténtalo de nuevo.');
  }
});

module.exports = router;