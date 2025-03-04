const express = require('express');
const router = express.Router();
const Asignatura = require('../models/asignatura');
const Estudio = require('../models/estudio');
const Usuario = require('../models/user');
const Software = require('../models/software');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose'); // Importa Mongoose
const { enviarCorreo } = require('../utils/email'); // Importar desde utils/email.js

const asignaturaSchema = new mongoose.Schema({
  nombre: String,
  curso: Number,
  estudio_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Estudio' },
  listaAlumnos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }], // Referencia al modelo Usuario
  listaProfesores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }] // Referencia al modelo Usuario
});
const fs = require('fs') //fileSystem
const csv = require('csv-parser');//Encargado de parsear


// Middleware isAuthenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

// Middleware isAuthenticatedAdmin
const isAuthenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.rol.toLowerCase() === 'admin') {
    return next();
  }
  res.redirect('/');
};

// Ruta para mostrar el formulario de creación de asignaturas
router.get('/signupAsignatura', isAuthenticatedAdmin, async (req, res) => {
  try {
    const estudios = await Estudio.find();
    res.render('signupAsignatura', { estudios, messages: req.flash() });
  } catch (error) {
    console.error('Error obteniendo los estudios:', error);
    res.status(500).send('Error al cargar los estudios.');
  }
});

// Ruta para procesar el formulario de creación de asignaturas
router.post('/signupAsignatura', isAuthenticatedAdmin, async (req, res) => {
  const { nombre, curso, estudio_id } = req.body;

  if (curso < 1 || curso > 4) {
    req.flash('errorMessage', 'El curso debe estar entre 1 y 4.');
    return res.redirect('/signupAsignatura');
  }

  try {
    const nuevaAsignatura = new Asignatura({ nombre, curso, estudio_id });
    await nuevaAsignatura.save();
    req.flash('signupMessage', 'Asignatura Creada.');
    return res.redirect('/signupAsignatura');
  } catch (error) {
    console.error('Error al crear la asignatura:', error);
    res.status(500).send('Error al crear la asignatura.');
  }
});

// Ruta para listar todas las asignaturas
router.get('/asignaturas', isAuthenticated, async (req, res) => {
    try {
        let asignaturas;
        if (req.user.rol.toLowerCase() === 'admin') {
            asignaturas = await cargarAsignaturasRegeneradaCompleta();
        } else {
            // Si es profesor o alumno, obtener solo las asignaturas del usuario
            asignaturas = await Asignatura.findByUser(req.user._id, req.user.rol);
        }

        res.render('asignaturas', {
            asignaturas: asignaturas,
            user: req.user
        });
    } catch (error) {
        console.error('Error obteniendo las asignaturas:', error);
        res.status(500).send('Error al cargar las asignaturas.');
    }
});


// Ruta para eliminar una asignatura (por Admin)
router.get('/asignaturas/delete/:id', isAuthenticatedAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Asignatura.deleteOne({ _id: id });
    res.redirect('/asignaturas');
  } catch (error) {
    console.error('Error al eliminar la asignatura:', error);
    res.status(500).send('Error al eliminar la asignatura.');
  }
});

// Ruta para agregar asignaturas a un alumno
router.get('/signupAsignaturaAlumno', isAuthenticated, async (req, res) => {
  try {
      const usuarios = await Usuario.find({
          rol: "Alumno"
      }).lean(); // Obtener todos los usuarios con rol "Alumno"

      const asignaturas = await cargarAsignaturasConEstudio(); // Obtener todas las asignaturas con la información de sus estudios

      // Modificamos la ruta para obtener las asignaturas en las que cada alumno está matriculado
      const usuariosConAsignaturas = await Promise.all(usuarios.map(async (usuario) => {
          const asignaturasAlumno = await Asignatura.find({
              listaAlumnos: usuario._id
          }).select('_id').lean(); // Obtener solo los IDs de las asignaturas en las que el alumno está matriculado

          return {
              ...usuario,
              asignaturas: asignaturasAlumno.map(a => a._id.toString()) // Mapear los IDs de las asignaturas a strings
          };
      }));

      // Renderizar la vista 'signupAsignaturaAlumno' y pasar los datos necesarios
      res.render('signupAsignaturaAlumno', {
          usuarios: usuariosConAsignaturas, // Pasar la información de los usuarios con las asignaturas en las que están matriculados
          asignaturas, // Pasar todas las asignaturas disponibles
          messages: req.flash() // Pasar los mensajes flash para mostrar al usuario
      });
  } catch (error) {
      console.error('Error obteniendo usuarios o asignaturas:', error);
      res.status(500).send('Error al cargar usuarios o asignaturas.');
  }
});
/*// Ruta para procesar el formulario de añadir asignaturas a un alumno y notificar al alumno
router.post('/signupAsignaturaAlumno', isAuthenticated, async (req, res) => {
  const { usuario_id, asignatura_id } = req.body;

  try {
    const asignatura = await Asignatura.findById(asignatura_id);
    if (!asignatura) {
      console.error("La asignatura no existe.");
      res.status(500).send('Error al matricular al alumno.');
    } else {
      const index = asignatura.listaAlumnos.indexOf(usuario_id);
      if (index !== -1) {
        asignatura.listaAlumnos.splice(index, 1);
        req.flash('signupMessage', 'Alumno Eliminado de la Asignatura.');
      } else {
        asignatura.listaAlumnos.push(usuario_id);
        req.flash('signupMessage', 'Alumno Matriculado en la Asignatura.');
      }
      await asignatura.save();
      return res.redirect('/signupAsignaturaAlumno');
    }
  } catch (error) {
    console.error('Error al matricular al alumno:', error);
    res.status(500).send('Error al matricular al alumno.');
  }
});
*/

// Ruta para procesar el formulario de añadir asignaturas a un alumno y notificar al alumno
router.post('/signupAsignaturaAlumno', isAuthenticated, async (req, res) => {
  const { usuario_id, asignatura_id } = req.body;

  try {
    const asignatura = await Asignatura.findById(asignatura_id);
    if (!asignatura) {
      console.error("La asignatura no existe.");
      res.status(500).send('Error al matricular al alumno.');
    } else {
      const index = asignatura.listaAlumnos.indexOf(usuario_id);
      if (index !== -1) {
        asignatura.listaAlumnos.splice(index, 1);
        req.flash('signupMessage', 'Alumno Eliminado de la Asignatura.');

        // Notificar al alumno
        const alumno = await Usuario.findById(usuario_id);
        if (alumno) {
          await enviarCorreo(alumno.email, 'Eliminado de Asignatura', `Has sido eliminado de la asignatura "${asignatura.nombre}".`);
        }
      } else {
        asignatura.listaAlumnos.push(usuario_id);
        req.flash('signupMessage', 'Alumno Matriculado en la Asignatura.');

        // Notificar al alumno
        const alumno = await Usuario.findById(usuario_id);
        if (alumno) {
          await enviarCorreo(alumno.email, 'Matriculado en Asignatura', `Has sido matriculado en la asignatura "${asignatura.nombre}".`);
        }
      }
      await asignatura.save();
      return res.redirect('/signupAsignaturaAlumno');
    }
  } catch (error) {
    console.error('Error al matricular al alumno:', error);
    res.status(500).send('Error al matricular al alumno.');
  }
});
// Ruta para agregar asignaturas a un profesor
router.get('/signupAsignaturaProfesor', isAuthenticated, async (req, res) => {
  try {
    const usuarios = await Usuario.find({ rol: "Profesor" }).lean();
    const asignaturas = await cargarAsignaturasConEstudio();
    
    // Obtener las asignaturas de cada profesor
    const usuariosConAsignaturas = await Promise.all(usuarios.map(async (usuario) => {
      const asignaturasProfesor = await Asignatura.find({ listaProfesores: usuario._id }).select('_id').lean();
      return {
        ...usuario,
        asignaturas: asignaturasProfesor.map(a => a._id.toString())
      };
    }));

    res.render('signupAsignaturaProfesor', { 
      usuarios: usuariosConAsignaturas, 
      asignaturas, 
      messages: req.flash() 
    });
  } catch (error) {
    console.error('Error obteniendo usuarios o asignaturas:', error);
    res.status(500).send('Error al cargar usuarios o asignaturas.');
  }
});

// Ruta para procesar el formulario de añadir asignaturas a un profesor
router.post('/signupAsignaturaProfesor', isAuthenticated, async (req, res) => {
  const { usuario_id, asignatura_id } = req.body;

  try {
    const asignatura = await Asignatura.findById(asignatura_id);
    if (!asignatura) {
      console.error("La asignatura no existe.");
      res.status(500).send('Error al asignar al profesor.');
    } else {
      const index = asignatura.listaProfesores.indexOf(usuario_id);
      if (index !== -1) {
        asignatura.listaProfesores.splice(index, 1);
        req.flash('signupMessage', 'Profesor Eliminado de la Asignatura.');
      } else {
        asignatura.listaProfesores.push(usuario_id);
        req.flash('signupMessage', 'Profesor añadido a la Asignatura.');
      }
      await asignatura.save();
      return res.redirect('/signupAsignaturaProfesor');
    }
  } catch (error) {
    console.error('Error al asignar al profesor:', error);
    res.status(500).send('Error al asignar al profesor.');
  }
});

// Método para cargar asignaturas con su estudio
const cargarAsignaturasConEstudio = async () => {
  try {
      const asignaturas = await Asignatura.find().lean();
      const estudios = await Estudio.find().lean();
      const estudiosMap = {};
      estudios.forEach(estudio => {
          estudiosMap[estudio._id] = estudio;
      });

      return asignaturas.map(asignatura => ({
          ...asignatura,
          estudio: estudiosMap[asignatura.estudio_id] || {
              nombre: "No encontrado",
              tipo: "-"
          }
      }));
  } catch (error) {
      console.error('Error obteniendo las asignaturas con estudio:', error);
      return [];
  }
};

// Método para cargar asignaturas con todos los datos completos
// Método para cargar asignaturas con todos los datos completos
const cargarAsignaturasRegeneradaCompleta = async () => {
  try {
      const asignaturas = await Asignatura.find().lean();
      const estudios = await Estudio.find().lean();
      const usuarios = await Usuario.find().lean();
      const estudiosMap = {};
      const usuariosMap = {};

      estudios.forEach(estudio => estudiosMap[estudio._id] = estudio);
      usuarios.forEach(usuario => usuariosMap[usuario._id] = usuario);

      return asignaturas.map(asignatura => ({
          ...asignatura,
          estudio: estudiosMap[asignatura.estudio_id] || {
              nombre: "No encontrado",
              tipo: "-"
          },
          listaAlumnos: asignatura.listaAlumnos.map(id => usuariosMap[id] || {
              nombre: "No encontrado",
              apellidos: "",
              email: ""
          }),
          listaProfesores: asignatura.listaProfesores.map(id => usuariosMap[id] || {
              nombre: "No encontrado",
              apellidos: "",
              email: ""
          })
      }));
  } catch (error) {
      console.error('Error obteniendo las asignaturas completas:', error);
      return [];
  }
};
// Código para hacer funcional el boton "Edit" de las asignaturas
// Ruta GET para mostrar el formulario de edición de una asignatura
router.get('/asignaturas/edit/:id', isAuthenticatedAdmin, async (req, res) => {
  try {
    const { id } = req.params; // Obtiene el ID de la asignatura desde los parámetros de la URL

    // Busca la asignatura por su ID
    const asignatura = await Asignatura.findById(id).lean();

    // Si no se encuentra la asignatura, redirige con un mensaje de error
    if (!asignatura) {
      req.flash('errorMessage', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }

    // Obtiene la lista de estudios para el formulario
    const estudios = await Estudio.find().lean();

    // Renderiza la vista de edición con los datos de la asignatura y la lista de estudios
    res.render('edit_asignatura', { asignatura, estudios, messages: req.flash() });
  } catch (error) {
    console.error('Error al cargar la página de edición:', error);
    res.status(500).send('Error al cargar la página de edición.');
  }
});

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

// Ruta para mostrar el software asociado a una asignatura
router.get('/asignaturas/:id/software', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params; // Obtiene el ID de la asignatura desde los parámetros de la URL

    // Busca la asignatura por su ID
    const asignatura = await Asignatura.findById(id).lean();

    // Si no se encuentra la asignatura, redirige con un mensaje de error
    if (!asignatura) {
      req.flash('errorMessage', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }

    // Busca el software asociado a la asignatura
    const software = await Software.find({ asignatura_id: id }).lean();

    // Renderiza la vista con los datos de la asignatura y el software asociado
    res.render('software_asignatura', { asignatura, software, user: req.user, messages: req.flash() });
  } catch (error) {
    console.error('Error al cargar el software de la asignatura:', error);
    res.status(500).send('Error al cargar el software de la asignatura.');
  }
});

// Ruta para importar asignaturas desde un archivo .CSV.
router.post('/addAsignaturasCSV', isAuthenticatedAdmin, async (req, res) => {
  try {
    if (!req.files || !req.files.archivo) {
      return res.status(400).send('No se subió ningún archivo');
    }

    const fileTasks = req.files.archivo;
    const filePath = `./files/asignaturas/${fileTasks.name}`;

    await fileTasks.mv(filePath);
    await readCSVFile(filePath, req.user._id);
    req.flash('signupMessage', 'CSV de Asignaturas importado con éxito. ');

    res.redirect('/insertCSV');
  } catch (error) {
    console.error('Error al subir CSV:', error);
    res.status(500).send('Error al subir archivo CSV');
  }
});

// Ruta para renderizar la vista insertCSV.
// Esto solo puede ser hecho por un Admin.
router.get('/insertCSV', isAuthenticatedAdmin, (req, res) => {
  res.render('insertCSV');
});

// Función para leer el archivo CSV de Asignaturas.
const readCSVFile = async (fileName, user) => {
  try {
    const results = [];
    fs.createReadStream(fileName)
      .pipe(csv({ separator: ',' }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Se obtiene ObjectId desde el modelo de asignatura.
        const ObjectId = Asignatura.db.base.Types.ObjectId;
        for (const asignData of results) {
          const asignatura = new Asignatura({
            nombre: asignData.nombre,
            curso: parseInt(asignData.curso, 10),
            estudio_id: asignData.estudio_id ? new ObjectId(asignData.estudio_id) : null,
            listaAlumnos: asignData.listaAlumnos ? asignData.listaAlumnos.split(';').filter(id => id.trim() !== '') : [],
            listaProfesores: asignData.listaProfesores ? asignData.listaProfesores.split(';').filter(id => id.trim() !== '') : []
          });
          await asignatura.insert();
        }
        console.log('CSV procesado correctamente');
      });
  } catch (error) {
    console.error('Error al procesar CSV:', error);
  }
};

module.exports = router;