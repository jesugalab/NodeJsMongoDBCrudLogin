const express = require('express');
const router = express.Router();
const Asignatura = require('../models/asignatura'); // Corregí el nombre del modelo
const Estudio = require('../models/estudio'); // Modelo de estudios
const Usuario = require('../models/user'); // Modelo de usuarios

// Middleware isAuthenticated definido directamente aquí
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { // Verifica si el usuario está autenticado
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};


// Ruta para listar las asignaturas con la información completa del estudio
router.get('/asignaturas', isAuthenticated, async (req, res) => {
  try {
    const asignaturas = await Asignatura.find().lean(); // Obtener todas las asignaturas
    const estudios = await Estudio.find().lean(); // Obtener todos los estudios
    // Crear un mapa de estudios por ID
    const estudiosMap = {};
    estudios.forEach(estudio => {
      estudiosMap[estudio._id] = estudio;
    });
    // Modificar cada asignatura para reemplazar estudio_id con el objeto completo del estudio
    const asignaturasConEstudio = asignaturas.map(asignatura => ({
      ...asignatura,
      estudio: estudiosMap[asignatura.estudio_id] || { nombre: "No encontrado", tipo: "-" }
    }));
    // Pasar la nueva lista de asignaturas a la vista
    res.render('asignaturas', { asignaturas: asignaturasConEstudio });
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


// para agregar una asignatura a un alumno
// Ruta para mostrar el formulario para añadir asignaturas a un alumno
router.get('/signupAsignaturaAlumno', isAuthenticated, async (req, res) => {
  try {
    const usuarios = await Usuario.find({rol:"Alumno"}); // Obtener todos los alumnos
    const asignaturas = await Asignatura.find(); // Obtener todos las asignaturas
    res.render('signupAsignaturaAlumno', { usuarios: usuarios || [], asignaturas: asignaturas || [], messages: req.flash() });
  } catch (error) {
    console.error('Error obteniendo los  usuarios o asignaturas en formulario de añadir asignariras a alumno:', error);
    res.status(500).send('Error al cargar  usuarios o asignaturas en formulario de añadir asignariras a alumno');
  }
});

// Ruta para procesar el formulario de añadir asignaturas a un alumno
router.post('/signupAsignaturaAlumno', isAuthenticated, async (req, res) => {
  const { usuario_id, asignatura_id} = req.body;
  try {
   // añade el alumno a la asignatura
    const asignatura = await Asignatura.findById(asignatura_id);
    if (!asignatura) {
        console.error("La asignatura no existe.");
        res.status(500).send('Error la matricular al Alumno en la Asignatura. Por favor, inténtalo de nuevo.');     
      } else {
      asignatura.listaAlumnos.push(usuario_id);
    }
    // Guarda la asignatura en la base de datos
    await asignatura.save();
    req.flash('signupMessage', 'Alumno matriculado en la Asignatura.'); // Guarda el mensaje flash
    return res.redirect('/signupAsignaturaAlumno'); // Redirige a la misma página
  } catch (error) {
    console.error('Error la matricular al Alumno en la Asignatura:', error);
    res.status(500).send('Error la matricular al Alumno en la Asignatura. Por favor, inténtalo de nuevo.');
  }
});

// para agregar una asignatura a un profesor

// Ruta para mostrar el formulario para añadir asignaturas a un profesor
router.get('/signupAsignaturaProfesor', isAuthenticated, async (req, res) => {
  try {
    const usuarios = await Usuario.find({ rol:"Profesor"}); // Obtener todos los Profesores
    const asignaturas = await Asignatura.find(); // Obtener todos las asignaturas
    res.render('signupAsignaturaProfesor', { usuarios: usuarios || [], asignaturas: asignaturas || [], messages: req.flash() });
  } catch (error) {
    console.error('Error obteniendo los  usuarios o asignaturas en formulario de añadir asignariras a alumno:', error);
    res.status(500).send('Error al cargar  usuarios o asignaturas en formulario de añadir asignariras a alumno');
  }
});

// Ruta para procesar el formulario de añadir asignaturas a un profesor
router.post('/signupAsignaturaProfesor', isAuthenticated, async (req, res) => {
  const { usuario_id, asignatura_id} = req.body;
  try {
   // añade el alumno a la asignatura
    const asignatura = await Asignatura.findById(asignatura_id);
    if (!asignatura) {
        console.error("La asignatura no existe.");
        res.status(500).send('Error la asignar al Porfesor en la Asignatura. Por favor, inténtalo de nuevo.');     
      } else {
      asignatura.listaProfesores.push(usuario_id);
    }
    // Guarda la asignatura en la base de datos
    await asignatura.save();
    req.flash('signupMessage', 'Profesor asignado a la Asignatura.'); // Guarda el mensaje flash
    return res.redirect('/signupAsignaturaProfesor'); // Redirige a la misma página
  } catch (error) {
    console.error('Error la asignar al Porfesor en la Asignatura:', error);
    res.status(500).send('Error la asignar al Porfesor en la Asignatura. Por favor, inténtalo de nuevo.');
  }
});

module.exports = router;