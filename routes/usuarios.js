const router = require('express').Router();
const passport = require('passport');
const Usuario = require('../models/user');

// Middleware isAuthenticated definido directamente aquí
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { // Verifica si el usuario está autenticado
      return next(); // Si está autenticado, continúa con la siguiente función
    }
    res.redirect('/'); // Si no está autenticado, redirige al inicio
  };

// Ruta para mostrar todas los usuarios
router.get('/usuarios', isAuthenticated, async (req, res) => {
  try {
    const usuarios = await Usuario.find(); // Obtener todos los usuarios
    res.render('usuarios', { user: req.user, usuarios, messages: req.flash() });
  } catch (error) {
    console.error('Error obteniendo los usuarios:', error);
    res.status(500).send('Error al cargar los usuarios');
  }
});

// Ruta para mostrar todas los profesores
router.get('/profesores', isAuthenticated, async (req, res) => {
    try {
        const usuarios = await Usuario.find({ rol: "Profesor" }); // Obtener todos los profesores
      res.render('profesores', { user: req.user, usuarios, messages: req.flash() });
    } catch (error) {
      console.error('Error obteniendo los profesores:', error);
      res.status(500).send('Error al cargar los profesores');
    }
  });

  // Ruta para mostrar todas los alumnos
router.get('/alumnos', isAuthenticated, async (req, res) => {
    try {
      const usuarios = await Usuario.find({ rol: "Alumno" }); // Obtener todos los alumnos
      res.render('alumnos', { user: req.user, usuarios, messages: req.flash() });
    } catch (error) {
      console.error('Error obteniendo los alumnos:', error);
      res.status(500).send('Error al cargar los alumnos');
    }
  });
  
module.exports = router;