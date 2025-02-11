const router = require('express').Router();
const passport = require('passport');
const Usuario = require('../models/user');

// Middleware isAuthenticated definido directamente aquí. Modificado para comprobar si el usuario es un Admin.
const isAuthenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.rol.toLowerCase() === 'admin') { // Verifica si el usuario está autenticado
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};


// Middleware modificado para comprobar que el usuario está autenticado y es Admin o Profesor.
const isAuthenticatedAdminProf = (req, res, next) => {
  if (req.isAuthenticated() && (req.user.rol.toLowerCase() === 'admin' || req.user.rol.toLowerCase() === 'profesor')) { 
    // Verifica si el usuario está autenticado
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};

// Ruta para mostrar todas los usuarios.
// Esto solo puede ser visto por los Admins.
router.get('/usuarios', isAuthenticatedAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find(); // Obtener todos los usuarios
    res.render('usuarios', { user: req.user, usuarios, messages: req.flash() });
  } catch (error) {
    console.error('Error obteniendo los usuarios:', error);
    res.status(500).send('Error al cargar los usuarios');
  }
});

// Ruta para mostrar todas los profesores
// Esto solo puede ser visto por los Admins.
router.get('/profesores', isAuthenticatedAdmin, async (req, res) => {
    try {
        const usuarios = await Usuario.find({ rol: "Profesor" }); // Obtener todos los profesores
      res.render('profesores', { user: req.user, usuarios, messages: req.flash() });
    } catch (error) {
      console.error('Error obteniendo los profesores:', error);
      res.status(500).send('Error al cargar los profesores');
    }
  });

  // Ruta para mostrar todas los alumnos
  // Esto solo puede ser visto por Admins y Profesores.
router.get('/alumnos', isAuthenticatedAdminProf, async (req, res) => {
    try {
      const usuarios = await Usuario.find({ rol: "Alumno" }); // Obtener todos los alumnos
      res.render('alumnos', { user: req.user, usuarios, messages: req.flash() });
    } catch (error) {
      console.error('Error obteniendo los alumnos:', error);
      res.status(500).send('Error al cargar los alumnos');
    }
  });

    // Método para eliminar usuarios.
    router.get('/usuarios/delete/:id', isAuthenticatedAdmin, async (req, res, next) => {
      let { id } = req.params;
      await Usuario.findByIdAndDelete(id);
      res.redirect('/usuarios');
    });
  
module.exports = router;