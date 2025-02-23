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

// Middleware para alumnos y profesores.
const isAuthenticatedNotAdmin = (req, res, next) => {
  if (req.isAuthenticated() && !req.user.rol.toLowerCase() === 'admin') { // Verifica si el usuario está autenticado
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};

//ruta cada usuario ve sus software
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


// Ruta para procesar el formulario de creación de software de una asignatura concreta
router.post('/signupSoftware/:id', isAuthenticated, async (req, res) => {
  const { descripcion, link} = req.body;
  const asignatura_id = req.params.id;


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
    return res.redirect('/asignaturas/'+asignatura_id+'/software'); // Redirige a la misma página
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

// Código para editar el software. 

// Ruta GET para mostrar el formulario de edición de software
router.get('/software/edit/:id', isAuthenticated, async (req, res) => {
  try {
    // Extraemos el 'id' de los parámetros de la URL
    const { id } = req.params;

    // Busca el software en la base de datos por su ID usando el modelo Software
    const software = await Software.findById(id).lean();

    // Si no se encuentra el software, respondemos con un error 404
    if (!software) {
      return res.status(404).send('Software no encontrado');
    }

    // Obtiene todas las asignaturas disponibles para que el admin las pueda seleccionar
    const asignaturas = await Asignatura.find().lean();

    // Renderiza la vista de 'edit_software', pasando el software y las asignaturas
    // También se pasan los mensajes flash (por si se necesita mostrar algún mensaje de alerta)
    res.render('edit_software', { software, asignaturas, messages: req.flash() });
  } catch (error) {
    // Si ocurre algún error, lo mostramos en la consola y enviamos una respuesta de error 500
    console.error('Error al cargar el software para edición:', error);
    res.status(500).send('Error al cargar el software para edición');
  }
});

// Ruta POST para actualizar el software después de que se haya editado
router.post('/software/edit/:id', isAuthenticated, async (req, res) => {
  try {
    // Extraemos el 'id' de los parámetros de la URL
    const { id } = req.params;
    
    // Extraemos los valores enviados desde el formulario de edición
    const { descripcion, link, asignatura_id } = req.body;

    // Actualiza el software en la base de datos usando el método updateOne
    // Utiliza el 'id' del software para encontrarlo y luego lo actualiza con los nuevos valores
    await Software.updateOne({ _id: id }, { descripcion, link, asignatura_id });

    // Después de actualizar, se guarda un mensaje flash que indica que la actualización fue exitosa
    req.flash('successMessage', 'Software actualizado correctamente.');

    // Redirige al usuario a la lista de software para mostrar la actualización
    res.redirect('/software');
  } catch (error) {
    // Si ocurre algún error durante la actualización, se captura y se muestra en la consola
    // Luego se envía una respuesta de error 500
    console.error('Error al actualizar el software:', error);
    res.status(500).send('Error al actualizar el software.');
  }
});


module.exports = router;