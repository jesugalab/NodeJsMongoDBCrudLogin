const express = require('express');
const router = express.Router();
const Estudio = require('../models/estudio');

// Middleware para comprbar que el usuario se ha conectado.
// Como en esta clase todos los métodos solo pueden ser usados por Admins, voy a modificar el isAuthenticated original.
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user.rol.toLowerCase() === 'admin') {
    return next(); // Si está autenticado, continúa con la siguiente función.
  }
  res.redirect('/'); // Si no se ha autenticado, lo redirige al inicio.
};

// Ruta para listar los estudios.
// Esto solo puede ser visto por Admins. 
router.get('/estudios', isAuthenticated, async (req, res) => {
  try {
    const estudios = await Estudio.find(); // Obtener todos los estudios
    res.render('estudios', { user: req.user, estudios, messages: req.flash() });
  } catch (error) {
    console.error('Error obteniendo los estudios:', error);
    res.status(500).send('Error al cargar los estudios');
  }
});

// Ruta para renderizar la vista "singupEstudio".
// Esto solo puede ser hecho por un Admin.
router.get('/signupEstudio', isAuthenticated, (req, res) => {
  res.render('signupEstudio');
});

// Ruta para insertar un nuevo estudio introducido en la vista "singupEstudio".
// Esto solo puede ser hecho por un Admin.
router.post('/signupEstudio', isAuthenticated, async (req, res) => {
  const { nombre, tipo } = req.body;

  try {
    // Validar que todos los campos requeridos estén presentes
    if (!nombre || !tipo) {
        req.flash('signupMessage', 'Por favor, completa todos los campos.');  // Guarda el mensaje flash
        return res.redirect('/signupEstudio'); // Redirigir de vuelta al formulario con mensaje
    }
    const nuevoEstudio = new Estudio({ nombre, tipo }); // Crea el estudio 
    await nuevoEstudio.insert(); // Guarda el estudio en la base de datos
    req.flash('signupMessage', 'Estudio Creado.'); // Guarda el mensaje flash
return res.redirect('/signupEstudio'); // Redirige a la misma página
  } catch (error) {
    console.error('Error al crear el estudio:', error);
    req.flash('signupMessage', 'ERROR al Crear el Estudio.'); // Guarda el mensaje flash
    return res.redirect('/signupEstudio'); // Redirige a la misma página
  }
});

module.exports = router;

/*


const express = require('express');
const router = express.Router();
const Estudio = require('../models/estudio'); // Corregír el nombre del modelo

// Middleware isAuthenticated definido directamente aquí
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { // Verifica si el usuario está autenticado
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};

// Ruta para mostrar el formulario de creación de asignaturas
router.get('/signupEstudio', isAuthenticated, (req, res) => {
  res.render('signupEstudio'); // Renderiza la vista ejs
});

// Ruta para procesar el formulario de creación de asignaturas
router.post('/signupEstudio', isAuthenticated, async (req, res) => {
  const { nombre, tipo} = req.body;

  try {
    // Crea una nuevo estudio
    const nuevoEstudio = new Estudio({
      nombre,
      tipo
    });
    // Guarda el estudio en la base de datos
    await nuevoEstudio.save();

    // Redirige al usuario a la página de perfil o a la lista de asignaturas
    res.redirect('/profile');
  } catch (error) {
    console.error('Error al crear el estudio:', error);
    res.status(500).send('Error al crear el estudio. Por favor, inténtalo de nuevo.');
  }
});

// Ruta para listar todas las asignaturas del usuario
router.get('/Estudios', isAuthenticated, async (req, res) => {
  try {
    // Busca las asignaturas del usuario autenticado
    const estudios = await Estudio.find({ usuario: req.user._id });

    // Renderiza la vista con las asignaturas
    res.render('estudios', { asignaturas });
  } catch (error) {
    console.error('Error al obtener los estudios:', error);
    res.status(500).send('Error al obtener los estudios. Por favor, inténtalo de nuevo.');
  }
});

module.exports = router;

*/