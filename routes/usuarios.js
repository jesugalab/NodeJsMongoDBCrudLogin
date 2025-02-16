const router = require('express').Router();
const passport = require('passport');
const Usuario = require('../models/user');
const Asignatura = require('../models/asignatura');

// Middleware isAuthenticated definido directamente aquí. Modificado para comprobar si el usuario es un Admin.
const isAuthenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.rol.toLowerCase() === 'admin') { // Verifica si el usuario está autenticado
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};


// Middleware isAuthenticated definido directamente aquí. Modificado para comprobar si el usuario es un Admin.
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { // Verifica si el usuario está autenticado
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
      let usuarios = [];

if (req.user.rol.toLowerCase() === "profesor") {
  usuarios = (await obtenerAlumnosDeProfesor(req.user.id)) || [];
} else if (req.user.rol.toLowerCase() === "admin") {
  usuarios = await Usuario.find({ rol: "Alumno" } ); // Obtener todos los alumnos
}
    
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

    // Ruta GET para mostrar el formulario de edición de usuario
router.get('/usuarios/edit/:id', isAuthenticated, async (req, res) => {
  try {
    // Busca al usuario en la base de datos utilizando el ID proporcionado en los parámetros de la URL
    const usuario = await Usuario.findById(req.params.id);

    // Si el usuario no existe, respondemos con un error 404
    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }

    // Si el usuario es encontrado, se pasa el objeto 'usuario' a la vista 'edit_usuario'
    // para mostrar el formulario con los datos actuales del usuario
    res.render('edit_usuario', { usuario });
  } catch (error) {
    // Si ocurre un error durante la consulta o la renderización de la vista, se captura y se muestra en la consola
    console.error(error);
    // Respondemos con un error 500 si no se puede cargar el formulario
    res.status(500).send('Error al cargar el formulario de edición');
  }
});

// Código para editar los usuarios
// Ruta POST para actualizar un usuario
router.post('/usuarios/update/:id', isAuthenticated, async (req, res) => {
  try {
    // Extrae los datos del formulario enviados por el usuario
    const { nombre, apellidos, email, rol } = req.body;

    // Busca al usuario en la base de datos utilizando el ID proporcionado en los parámetros de la URL
    const usuario = await Usuario.findById(req.params.id);

    // Si el usuario no existe, respondemos con un error 404
    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }

    // Si el usuario es encontrado, se actualizan sus propiedades con los nuevos valores del formulario
    usuario.nombre = nombre;
    usuario.apellidos = apellidos;
    usuario.email = email;
    usuario.rol = rol;

    // Guardamos los cambios en la base de datos
    await usuario.save();

    // Después de actualizar el usuario, se redirige a la lista de usuarios
    res.redirect('/usuarios');
  } catch (error) {
    // Si ocurre un error durante la actualización, se captura y se muestra en la consola
    console.error(error);
    // Respondemos con un error 500 si no se puede actualizar el usuario
    res.status(500).send('Error al actualizar el usuario');
  }
});

async function obtenerAlumnosDeProfesor(profesorId) {
  try {
    // 1. Buscar las asignaturas donde el profesor está asignado
    const asignaturas = await Asignatura.find({ listaProfesores: profesorId });

    // 2. Extraer todos los IDs de alumnos de esas asignaturas
    const alumnosIds = asignaturas.flatMap(asignatura => asignatura.listaAlumnos);

    // 3. Buscar los alumnos por sus IDs
    const alumnos = await Usuario.find({ _id: { $in: alumnosIds } });

    return alumnos; // Devuelve la lista de alumnos
  } catch (error) {
    console.error("Error al obtener alumnos del profesor:", error);
    return [];
  }
}
module.exports = router;