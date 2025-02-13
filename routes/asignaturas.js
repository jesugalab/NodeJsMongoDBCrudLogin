const express = require('express');
const router = express.Router();
const Asignatura = require('../models/asignatura'); // Corregí el nombre del modelo
const Estudio = require('../models/estudio'); // Modelo de estudios
const Usuario = require('../models/user'); // Modelo de usuarios
const asignatura = require('../models/asignatura');

// Middleware isAuthenticated definido directamente aquí
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { // Verifica si el usuario está autenticado
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};

// Middleware isAuthenticated modificado para comprobar que el usuario es un Admin.
const isAuthenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.rol.toLowerCase() === 'admin') { // Verifica si el usuario está autenticado y es un admin.
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};

// Ruta para mostrar el formulario de creación de asignaturas con los estudios
// ** Se usa por Admin.
router.get('/signupAsignatura', isAuthenticatedAdmin, async (req, res) => {
  try {
    const estudios = await Estudio.find(); // Obtener todos los estudios
    res.render('signupAsignatura', { estudios, messages: req.flash() });
  } catch (error) {
    console.error('Error obteniendo los estudios en  formulario de creación de asignaturas:', error);
    res.status(500).send('Error al cargar los estudios en formulario de creación de asignaturas');
  }
});

// Ruta para procesar el formulario de creación de asignaturas
// ** Se usa por Admin.
router.post('/signupAsignatura', isAuthenticatedAdmin, async (req, res) => {
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
// Se usa por Admin, profesor y alumno.
//METODOS RUTA
router.get('/asignaturas', isAuthenticated, async (req, res) => {
  try {
      // Obtener todas las asignaturas con su estudio
    if (req.user.rol.toLowerCase() === 'admin') {
    const asignaturas = await cargarAsignaturasRegeneradaCompleta()
    res.render('asignaturas', { asignaturas: asignaturas });
    }else {
      // Si es profesor o alumno, obtener solo las asignaturas del usuario
      asignaturas = await Asignatura.findByUser(req.user._id, req.user.rol);
  }

  res.render('asignaturas', {
      asignaturas: asignaturas,
      user: req.user
  });
} catch (error) {
    console.error('Error obteniendo las asignaturas:', error);
    res.status(500).send('Error al cargar las asignaturas ..................');
  }
});

// Ruta para eliminar una asignatura
// Se usa por admin.
router.get('/asignaturas/delete/:id', isAuthenticatedAdmin, async (req, res) => {
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
// Método para eliminar asignaturas.
router.get('/asignaturas/delete/:id', isAuthenticated, async (req, res, next) => {
  let { id } = req.params;
  await Asignatura.findByIdAndDelete(id);
  res.redirect('/asignaturas');
});


// para agregar una asignatura a un alumno
// Ruta para mostrar el formulario para añadir asignaturas a un alumno
router.get('/signupAsignaturaAlumno', isAuthenticated, async (req, res) => {
  try {
    const usuarios = await Usuario.find({rol:"Alumno"}); // Obtener todos los alumnos
    const asignaturas = await cargarAsignaturasConEstudio(); // Obtener todos las asignaturas con su estudio
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
   // añade el alumno a la asignatura si no está ya matriculado y sino lo elimina
    const asignatura = await Asignatura.findById(asignatura_id);
    if (!asignatura) {
        console.error("La asignatura no existe.");
        res.status(500).send('Error la matricular al Alumno en la Asignatura. Por favor, inténtalo de nuevo.');     
} else {
          let index = (asignatura.listaAlumnos.indexOf(usuario_id));
          if (index !== -1) {
            asignatura.listaAlumnos.splice(index, 1);
            req.flash('signupMessage', 'Alumno Eliminado de la Asignatura.'); // Guarda el mensaje flash    
        } else  {
            asignatura.listaAlumnos.push(usuario_id); 
               req.flash('signupMessage', 'Alumno Matriculado en la Asignatura.'); // Guarda el mensaje flash 
        }
      }
    // Guarda la asignatura en la base de datos
    await asignatura.save();
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
    const asignaturas = await cargarAsignaturasConEstudio(); // Obtener todos las asignaturas con su estudio
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
        let index = (asignatura.listaProfesores.indexOf(usuario_id));
        if (index !== -1) {
          asignatura.listaProfesores.splice(index, 1);
          req.flash('signupMessage', 'Profesor Eliminado de la Asignatura.'); // Guarda el mensaje flash    
      } else  {
          asignatura.listaProfesores.push(usuario_id); 
             req.flash('signupMessage', 'Profesor añadido a la Asignatura.'); // Guarda el mensaje flash 
      }
    }
    
    // Guarda la asignatura en la base de datos
    await asignatura.save();
    return res.redirect('/signupAsignaturaProfesor'); // Redirige a la misma página
  } catch (error) {
    console.error('Error la asignar al Porfesor en la Asignatura:', error);
    res.status(500).send('Error la asignar al Porfesor en la Asignatura. Por favor, inténtalo de nuevo.');
  }
});


// Ruta GET para mostrar el formulario de edición de una asignatura
router.get('/asignaturas/edit/:id', isAuthenticatedAdmin, async (req, res) => {
  try {
    const { id } = req.params; // Extrae el ID de la asignatura desde los parámetros de la URL
    const asignatura = await Asignatura.findById(id).lean(); // Busca la asignatura por su ID en la base de datos
    const estudios = await Estudio.find().lean(); // Obtiene todos los estudios disponibles en la base de datos

    // Si la asignatura no se encuentra, responde con un error 404
    if (!asignatura) {
      return res.status(404).send('Asignatura no encontrada');
    }

    // Renderiza la vista de edición con la asignatura y los estudios disponibles
    res.render('edit_asignatura', { asignatura, estudios, messages: req.flash() });
  } catch (error) {
    console.error('Error al obtener la asignatura:', error);
    res.status(500).send('Error al cargar la asignatura'); // Responde con un error 500 en caso de fallo
  }
});


// Código para hacer funcional el boton "Edit" de las asignaturas
// Ruta POST para procesar la actualización de una asignatura
router.post('/asignaturas/edit/:id', isAuthenticatedAdmin, async (req, res) => {
  try {
    const { id } = req.params; // Extrae el ID de la asignatura desde los parámetros de la URL
    const { nombre, curso, estudio_id } = req.body; // Extrae los datos enviados desde el formulario

    // Actualiza la asignatura en la base de datos con los nuevos valores
    await Asignatura.findByIdAndUpdate(id, { nombre, curso, estudio_id });

    // Muestra un mensaje de éxito y redirige a la lista de asignaturas
    req.flash('successMessage', 'Asignatura actualizada correctamente.');
    res.redirect('/asignaturas');
  } catch (error) {
    console.error('Error al actualizar la asignatura:', error);
    res.status(500).send('Error al actualizar la asignatura.'); // Responde con un error 500 en caso de fallo
  }
});
// Ruta para procesar el formulario de eliminar asignaturas a un profesor
router.post('/signupAsignaturaProfesor/eliminar/', isAuthenticated, async (req, res) => {
  const { usuario_id, asignatura_id} = req.body;
  try {
   // añade el alumno a la asignatura
    const asignatura = await Asignatura.findById(asignatura_id);
    if (!asignatura) {
        console.error("La asignatura no existe.");
        res.status(500).send('Error la eliminar al Porfesor en la Asignatura. Por favor, inténtalo de nuevo.');
      } else {
      asignatura.listaProfesores.deleteOne(usuario_id);
    }
    // Guarda la asignatura en la base de datos
    await asignatura.save();
    req.flash('signupMessage', 'Profesor eliminado de la Asignatura.'); // Guarda el mensaje flash
    return res.redirect('/signupAsignaturaProfesor'); // Redirige a la misma página
  } catch (error) {
    console.error('Error la elimninar al Porfesor en la Asignatura:', error);
    res.status(500).send('Error la eliminar al Porfesor en la Asignatura. Por favor, inténtalo de nuevo.');
  }
});


const cargarAsignaturasConEstudio = (  async (req, res) => {
  try {
    //  const asignaturas = await Asignatura.find().populate('estudio_id').lean(); // Obtener todas las asignaturas con su estudio
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
    return asignaturasConEstudio ;
  } catch (error) {
    console.error('Error obteniendo las asignaturas:', error);
    res.status(500).send('Error al cargar las asignaturas');
    return [];
  }
});


const cargarAsignaturasRegeneradaCompleta = async (req, res) => {
  try {
    const asignaturas = await Asignatura.find().lean(); // Obtener todas las asignaturas
    const estudios = await Estudio.find().lean(); // Obtener todos los estudios
    const usuarios = await Usuario.find().lean(); // Obtener todos los usuarios
    // Crear un mapa de estudios por ID
    const estudiosMap = {};
    estudios.forEach(estudio => {
      estudiosMap[estudio._id] = estudio;
    });
    // Crear un mapa de usuarios por ID
    const usuariosMap = {};
    usuarios.forEach(usuario => {
      usuariosMap[usuario._id] = usuario;
    });
    // Modificar cada asignatura para reemplazar `estudio_id`, `listaAlumnos` y `listaProfesores`
    const asignaturasConDatos = asignaturas.map(asignatura => ({
      ...asignatura,
      estudio: estudiosMap[asignatura.estudio_id] || { nombre: "No encontrado", tipo: "-" },
      listaAlumnos: asignatura.listaAlumnos.map(id => usuariosMap[id] || { nombre: "No encontrado", apellidos: "", email: "" }),
      listaProfesores: asignatura.listaProfesores.map(id => usuariosMap[id] || { nombre: "No encontrado", apellidos: "", email: "" })
    }));
    return asignaturasConDatos;
  } catch (error) {
    console.error('Error obteniendo las asignaturas:', error);
    res.status(500).send('Error al cargar las asignaturas');
    return [];
  }
};

module.exports = router;