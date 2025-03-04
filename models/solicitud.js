const mongoose = require('mongoose');
const { Schema } = mongoose;

const solicitudSchema = new Schema({
  tipo: { type: String, required: true, enum: ['queja', 'sugerencia', 'error'] },
  contenido: { type: String, required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'listaUsuario', required: true },
  fecha: { type: Date, default: Date.now },
  estado: { type: String, default: 'pendiente', enum: ['pendiente', 'en proceso', 'resuelto'] }
});

module.exports = mongoose.model('Solicitud', solicitudSchema);