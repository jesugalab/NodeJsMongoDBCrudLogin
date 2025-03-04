const express = require('express');
const router = express.Router();
const Asignatura = require('../models/asignatura'); // Modelo de asignaturas
const Software = require('../models/software'); // Modelo de software
const Usuario = require('../models/user'); // Modelo de usuarios
const { enviarCorreo } = require('../utils/email'); // Función para enviar correos

// Middleware isAuthenticated definido directamente aquí
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { // Verifica si el usuario está autenticado
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};

// Middleware para alumnos y profesores.
const isAuthenticatedNotAdmin = (req, res, next) => {
  if (req.isAuthenticated() && !req.user.rol.toLowerCase() === 'admin') { // Verifica si el usuario está autenticado
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};

// Ruta para que cada usuario vea su software
router.get('/software', isAuthenticated, async (req, res) => {
  try {
    const software = await Software.findByUser(req.user._id, req.user.rol);
    const asignaturas = await Asignatura.find().lean();

    const asignaturaMap = {};
    asignaturas.forEach(asignatura => {
      asignaturaMap[asignatura._id] = asignatura;
    });

    const softwareConAsig = software.map(sw => ({
      ...sw,
      asignatura: asignaturaMap[sw.asignatura_id] || {
        nombre: "No encontrada",
        tipo: "-"
      }
    }));

    res.render('software', {
      software: softwareConAsig,
      user: req.user
    });
  } catch (error) {
    console.error('Error obteniendo el software:', error);
    res.status(500).send('Error al cargar el software');
  }
});

// Ruta para mostrar el formulario de creación de software con las asignaturas
router.get('/signupSoftware', isAuthenticated, async (req, res) => {
  try {
    const asignaturas = await Asignatura.find(); // Obtener todas las asignaturas
    res.render('signupSoftware', { asignaturas, messages: req.flash() });
  } catch (error) {
    console.error('Error obteniendo las asignaturas en formulario de creación de software:', error);
    res.status(500).send('Error al cargar las asignaturas en formulario de creación de software');
  }
});

// Ruta para procesar el formulario de creación de software (sin guardar notificaciones)
router.post('/signupSoftware', isAuthenticated, async (req, res) => {
  const { descripcion, link, asignatura_id } = req.body;

  let archivo = null;
  if (req.files && req.files.archivo) {
    let EDFile = req.files.archivo;
    archivo = `${req.user._id}-_-${Date.now()}-_-${EDFile.name}`;
    await EDFile.mv(`./files/${req.user._id}-_-${Date.now()}-_-${EDFile.name}`);
  }

  try {
    // Obtener la asignatura a la que se añadió el software
    const asignatura = await Asignatura.findById(asignatura_id);

    // Crear el software en la base de datos
    const nuevoSoftware = new Software({
      descripcion,
      link,
      archivo,
      asignatura_id,
    });

    await nuevoSoftware.save();

    if (asignatura) {
      console.log(`Alumnos en la asignatura ${asignatura.nombre}:`, asignatura.listaAlumnos); // Verifica los alumnos

      // Enviar correos electrónicos a los alumnos (sin guardar notificaciones)
      const alumnos = await Usuario.find({ _id: { $in: asignatura.listaAlumnos } });

      alumnos.forEach(async alumno => {
        console.log(`Enviando correo a: ${alumno.email}`); // Verifica los correos
        await enviarCorreo(alumno.email, 'Nuevo software añadido', `Se ha añadido nuevo software a la asignatura ${asignatura.nombre}.`);
      });
    }

    req.flash('signupMessage', 'Software creado y correos enviados.'); // Guarda el mensaje flash
    return res.redirect('/signupSoftware'); // Redirige a la misma página
  } catch (error) {
    console.error('Error al procesar el formulario de creación de software:', error);
    res.status(500).send('Error al procesar el formulario de creación de software. Por favor, inténtalo de nuevo.');
  }
});

// Ruta para procesar el formulario de creación de software de una asignatura concreta
router.post('/signupSoftware/:id', isAuthenticated, async (req, res) => {
  const { descripcion, link } = req.body;
  const asignatura_id = req.params.id;

  let archivo = null;
  if (req.files && req.files.archivo) {
    let EDFile = req.files.archivo;
    archivo = `${req.user._id}-_-${Date.now()}-_-${EDFile.name}`;
    await EDFile.mv(`./files/${req.user._id}-_-${Date.now()}-_-${EDFile.name}`);
  }

  try {
    // Crear el software en la base de datos
    const nuevoSoftware = new Software({
      descripcion,
      link,
      archivo,
      asignatura_id,
    });

    await nuevoSoftware.save();

    // Obtener la asignatura a la que se añadió el software
    const asignatura = await Asignatura.findById(asignatura_id);

    if (asignatura) {
      console.log(`Alumnos en la asignatura ${asignatura.nombre}:`, asignatura.listaAlumnos); // Verifica los alumnos

      // Enviar correos electrónicos a los alumnos
      const alumnos = await Usuario.find({ _id: { $in: asignatura.listaAlumnos } });

      alumnos.forEach(async alumno => {
        console.log(`Enviando correo a: ${alumno.email}`); // Verifica los correos
        await enviarCorreo(alumno.email, 'Nuevo software añadido', `Se ha añadido nuevo software a la asignatura ${asignatura.nombre}.`);
      });
    }

    req.flash('signupMessage', 'Software Creado.'); // Guarda el mensaje flash
    return res.redirect(`/asignaturas/${asignatura_id}/software`); // Redirige a la misma página
  } catch (error) {
    console.error('Error al crear el software:', error);
    res.status(500).send('Error al crear el software. Por favor, inténtalo de nuevo.');
  }
});

// Ruta para eliminar un software
router.get('/software/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Elimina el software por su ID
    await Software.deleteOne({ _id: id });

    // Redirige al usuario a la lista de software
    res.redirect('/software');
  } catch (error) {
    console.error('Error al eliminar el software:', error);
    res.status(500).send('Error al eliminar el software. Por favor, inténtalo de nuevo.');
  }
});

// Ruta GET para mostrar el formulario de edición de software
router.get('/software/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Busca el software en la base de datos por su ID
    const software = await Software.findById(id).lean();

    // Si no se encuentra el software, respondemos con un error 404
    if (!software) {
      return res.status(404).send('Software no encontrado');
    }

    // Obtiene todas las asignaturas disponibles
    const asignaturas = await Asignatura.find().lean();

    // Renderiza la vista de edición
    res.render('edit_software', { software, asignaturas, messages: req.flash() });
  } catch (error) {
    console.error('Error al cargar el software para edición:', error);
    res.status(500).send('Error al cargar el software para edición');
  }
});

// Ruta POST para actualizar el software después de que se haya editado
router.post('/software/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, link, asignatura_id } = req.body;

    let archivo = null;
    if (req.files && req.files.archivo) {
      let EDFile = req.files.archivo;
      archivo = `${req.user._id}-_-${Date.now()}-_-${EDFile.name}`;
      await EDFile.mv(`./files/${req.user._id}-_-${Date.now()}-_-${EDFile.name}`);
    }

    // Actualiza el software en la base de datos
    await Software.updateOne({ _id: id }, { descripcion, link, archivo, asignatura_id });

    // Guarda un mensaje flash de éxito
    req.flash('successMessage', 'Software actualizado correctamente.');

    // Redirige al usuario a la lista de software
    res.redirect('/software');
  } catch (error) {
    console.error('Error al actualizar el software:', error);
    res.status(500).send('Error al actualizar el software.');
  }
});

module.exports = router;