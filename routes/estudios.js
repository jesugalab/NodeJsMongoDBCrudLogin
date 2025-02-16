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

// Código para editar el estudio. 

// Ruta GET para mostrar el formulario de edición de estudio
router.get('/estudios/edit/:id', isAuthenticated, async (req, res) => {
  try {
    // Extraemos el 'id' de los parámetros de la URL
    const { id } = req.params;

    // Busca el software en la base de datos por su ID usando el modelo Estudio
    const estudio = await Estudio.findOne({ _id: id }).lean();

    // Si no se encuentra el software, respondemos con un error 404
    if (!estudio) {
      req.flash('errorMessage', 'No se encontró el estudio.');
      return res.redirect('/estudios');
    }
 res.render('edit_estudio', { estudio: estudio , messages: req.flash() });
  } catch (error) {
    // Si ocurre algún error, lo mostramos en la consola y enviamos una respuesta de error 500
    console.error('Error al cargar el estudio para edición:', error);
    res.status(500).send('Error al cargar el estucio para edición');
  }
});

// Ruta POST para actualizar el software después de que se haya editado
router.post('/estudios/edit/:id', isAuthenticated, async (req, res) => {
  try {
    // Extraemos el 'id' de los parámetros de la URL
    const { id } = req.params;
    
    // Extraemos los valores enviados desde el formulario de edición
    const { nombre, tipo } = req.body;
 // Utiliza el 'id' del estudio para encontrarlo y luego lo actualiza con los nuevos valores
    await Estudio.updateOne({ _id: id }, { nombre, tipo });

    // Después de actualizar, se guarda un mensaje flash que indica que la actualización fue exitosa
    req.flash('successMessage', 'Estudio actualizado correctamente.');

    // Redirige al usuario a la lista de estucios para mostrar la actualización
    res.redirect('/estudios');
  } catch (error) {
    // Si ocurre algún error durante la actualización, se captura y se muestra en la consola
    // Luego se envía una respuesta de error 500
    console.error('Error al actualizar el estudio:', error);
    res.status(500).send('Error al actualizar el estudio.');
  }
});


// Ruta para eliminar un estudio
router.get('/estudios/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Elimina la asignatura por su ID
    await Estudio.deleteOne({ _id: id });

    // Redirige al usuario a la lista de estudios
    res.redirect('/estudios');
  } catch (error) {
    console.error('Error al eliminar el estudio:', error);
    res.status(500).send('Error al eliminar el estudio. Por favor, inténtalo de nuevo.');
  }
});

module.exports = router;

