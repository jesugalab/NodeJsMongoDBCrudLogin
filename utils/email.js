// utils/email.js
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
    user: 'accesoadatostema12@gmail.com', // Correo del programa
    pass: 'efbc htwo krse pzaz' // Contraseña de aplicación
    }
});

const enviarCorreo = async (destinatario, asunto, mensaje) => {
  console.log(`Intentando enviar correo a: ${destinatario}`); // Verifica que se está llamando
    let mailOptions = {
    from: 'accesoadatostema12@gmail.com',
    to: destinatario,
    subject: asunto,
    text: mensaje
    };

    await transporter.sendMail(mailOptions)
    .then(result => console.log('Correo enviado:', result))
    .catch(error => console.error('Error enviando correo:', error));
};

module.exports = { enviarCorreo };