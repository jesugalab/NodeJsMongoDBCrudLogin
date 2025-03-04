const router = require('express').Router();
const Solicitud = require('../models/solicitud');
const nodemailer = require('nodemailer');
const Usuario = require('../models/user');
const { enviarCorreo } = require('../utils/email');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose'); // Importa Mongoose
// Este middleware verifica si el usuario está autenticado. Si lo está, permite que la solicitud continúe; si no, redirige al inicio.
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { // Verifica si el usuario está autenticado
      return next(); // Si está autenticado, continúa con la siguiente función
    }
    res.redirect('/'); // Si no está autenticado, redirige al inicio
  };

// Esta función asíncrona busca todos los usuarios con rol de administrador, obtiene los detalles completos de la solicitud, 
//configura un transporter de nodemailer, y envía un correo electrónico a cada administrador.
async function notificarAdmins(solicitud) {
    const admins = await Usuario.find({ rol: 'Admin' });
    console.log('Administradores encontrados:', admins.toString());
  
    if (admins && admins.length > 0) {
      console.log('Primer administrador encontrado:', admins[0]);
    } else {
      console.log('No se encontraron administradores.');
    }
  
    const solicitudCompleta = await Solicitud.findById(solicitud._id).populate('usuario');
  
    for (let admin of admins) {
      try {
        console.log(`Enviando correo a: ${admin.email}`);
        await enviarCorreo(
          admin.email,
          `Nueva solicitud: ${solicitudCompleta.tipo}`,
          `Se ha recibido una nueva ${solicitudCompleta.tipo} de ${solicitudCompleta.usuario.nombre}. Contenido: ${solicitudCompleta.contenido}`
        );
        console.log(`Correo enviado correctamente a ${admin.email}`);
      } catch (error) {
        console.error(`Error al enviar correo a ${admin.email}:`, error);
      }
    }
  }
//Esta ruta renderiza la vista 'solicitud' cuando un usuario autenticado accede a '/enviarSugerencia'.
router.get('/enviarSugerencia', isAuthenticated, (req, res) => {
    console.log('Accediendo a la ruta GET /enviarSugerencia');
    res.render('solicitud', { user: req.user });
  });

// Esta ruta maneja la creación de una nueva solicitud cuando se envía el formulario.
router.post('/enviarSugerencia', isAuthenticated, async (req, res) => {
    try {
      const { tipo, contenido } = req.body;
      const nuevaSolicitud = new Solicitud({
        tipo,
        contenido,
        usuario: req.user._id
      });
      await nuevaSolicitud.save();
  
      // Enviar correo electrónico a los administradores
      await notificarAdmins(nuevaSolicitud);
  
      req.flash('success_msg', 'Solicitud enviada correctamente');
      res.redirect('/profile');
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      req.flash('error_msg', 'Error al enviar la solicitud');
      res.redirect('/profile');
    }
  });

module.exports = router;//Exporta el router para que pueda ser utilizado en la aplicación principal.