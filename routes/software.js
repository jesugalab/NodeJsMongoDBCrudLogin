const express = require('express');
const router = express.Router();
const Asignatura = require('../models/asignatura'); // Corregí el nombre del modelo
const Software = require('../models/software'); // Modelo de estudios


// Middleware isAuthenticated definido directamente aquí
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { // Verifica si el usuario está autenticado
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};


/*// Ruta para listar los software con la información completa de la asignatura
router.get('/software', isAuthenticated, async (req, res) => {
  try {
    const asignaturas = await Asignatura.find().lean(); // Obtener todas las asignaturas
    const software = await Software.find().lean(); // Obtener todos los software
    // Crear un mapa de asignaturas por ID
    const asignaturaMap = {};
    asignaturas.forEach(asignatura => {
      asignaturaMap[asignatura._id] = asignatura;
    });
    // Modificar cada  para reemplazar asignatura_id con el objeto completo de asignatura
    const softwareConAsig = software.map(software => ({
      ...software,
      asignatura: asignaturaMap[software.asignatura_id] || { nombre: "No encontrada", tipo: "-" }
    }));
    // Pasar la nueva lista de software a la vista
    res.render('software', { software: softwareConAsig });
  } catch (error) {
    console.error('Error obteniendo el software:', error);
    res.status(500).send('Error al cargar el software');
  }
});*/
// Ruta para que los alumnos vean el software de sus asignaturas
router.get('/software', isAuthenticated, async (req, res) => {
  try {
    if (req.user.rol.toLowerCase() == 'alumno'||req.user.rol.toLowerCase() == 'profesor') {
      const software = await Software.findByAlumno(req.user._id);
    res.render('software', { software });
  
    }else if (req.user.rol.toLowerCase() == 'admin') {
      const software = await Software.findByAlumno(req.user._id);
    res.render('software', { software });
    }
  } catch (error) {
    console.error('Error obteniendo el software del alumno:', error);
    res.status(500).send('Error al cargar el software del alumno');
  }

    
});
// Ruta para mostrar el formulario de creación de software con las asignaturas
router.get('/signupSoftware', isAuthenticated, async (req, res) => {
  try {
    const asignaturas = await Asignatura.find(); // Obtener todos los estudios
    res.render('signupSoftware', { asignaturas, messages: req.flash() });
  } catch (error) {
    console.error('Error obteniendo las asignaturas en formulario de creación de software:', error);
    res.status(500).send('Error al cargar las asignaturas en formulario de creación de software');
  }
});

// Ruta para procesar el formulario de creación de software
router.post('/signupSoftware', isAuthenticated, async (req, res) => {
  const { descripcion, link, asignatura_id } = req.body;

  try {
    // Crea una nueva asignatura
    const nuevoSoftware = new Software({
      descripcion,
      link,
      asignatura_id,
    });

    // Guarda el software en la base de datos
    await nuevoSoftware.save();
    req.flash('signupMessage', 'Software Creado.'); // Guarda el mensaje flash
    return res.redirect('/signupSoftware'); // Redirige a la misma página
  } catch (error) {
    console.error('Error al crear el software:', error);
    res.status(500).send('Error al crear el software. Por favor, inténtalo de nuevo.');
  }
});

// Ruta para eliminar un software
router.get('/software/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Elimina la asignatura por su ID
    await Software.deleteOne({ _id: id });

    // Redirige al usuario a la lista de asignaturas
    res.redirect('/software');
  } catch (error) {
    console.error('Error al eliminar el software:', error);
    res.status(500).send('Error al eliminar el software. Por favor, inténtalo de nuevo.');
  }
});

module.exports = router;