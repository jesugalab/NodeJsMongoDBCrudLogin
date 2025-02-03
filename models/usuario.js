const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const { Schema } = mongoose;

const usuarioSchema = new Schema({
  email:  { type: String, required: true },
  password:  { type: String, required: true },
  nombre:  { type: String, required: true },
  apellidos:  { type: String, required: true },
  rol:  { type: String, required: true },
});

usuarioSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

usuarioSchema.methods.comparePassword= function (password) {
  return bcrypt.compareSync(password, this.password);
};

usuarioSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};
usuarioSchema.methods.comparePassword= function (password) {
  return bcrypt.compareSync(password, this.password);
};

usuarioSchema.methods.findEmail= async (email) => {
  const usuario = mongoose.model("listaUsuario", usuarioSchema);
  return  await usuario.findOne({'email': email})
  .then(result => {return result})
  .catch(error => console.log(error));

};

usuarioSchema.methods.insert= async function () {
  //await this.save();
  await this.save()
  .then(result => console.log(result))
  .catch(error => console.log(error));
};
module.exports = mongoose.model('listaUsuario', usuarioSchema);
