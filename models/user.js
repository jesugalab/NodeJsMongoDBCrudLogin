const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const { Schema } = mongoose;

const userSchema = new Schema({
  email:  { type: String, required: true },
  password:  { type: String, required: true },
  nombre:  { type: String, required: true },
  apellidos:  { type: String, required: true },
  rol:  { type: String, required: true }
});

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

userSchema.methods.comparePassword= function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};
userSchema.methods.comparePassword= function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.findEmail= async function (email)  {
  const User = mongoose.model("listaUsuario", userSchema);
  return  await User.findOne({'email': email})
  .then(result => {return result})
  .catch(error => console.log(error));

};


userSchema.methods.insert= async function () {
  //await this.save();
  await this.save()
  .then(result => console.log(result))
  .catch(error => console.log(error));
};
module.exports = mongoose.model('listaUsuario', userSchema);



userSchema.methods.addEstudio = async function (estudioData) {
  if (this.rol !== "admin") {
    throw new Error("No tienes permisos para añadir estudios.");
  }

  const Estudio = mongoose.model("listaEstudio", EstudioSchema);

  const nuevoEstudio = new Estudio({
    nombre: estudioData.nombre,
    descripcion: estudioData.descripcion
  });

  return await nuevoEstudio.save()
    .then(result => result)
    .catch(error => console.log(error));
};


userSchema.methods.addAsignatura = async function (asignaturaData) {
  if (this.rol !== "admin") {
    throw new Error("No tienes permisos para añadir asignaturas.");
  }

  const Asignatura = mongoose.model("listaAsignatura", AsignaturaSchema);

  const nuevaAsignatura = new Asignatura({
    nombre: asignaturaData.nombre,
    curso: asignaturaData.curso,
    estudio_id: asignaturaData.estudio_id,
    listaAlumnos: [],
    listaProfesores: []
  });

  return await nuevaAsignatura.save()
    .then(result => result)
    .catch(error => console.log(error));
};


userSchema.methods.addAlumnoToAsignatura = async function (asignaturaId, alumnoId) {
  if (this.rol !== "admin") {
    throw new Error("No tienes permisos para añadir alumnos a una asignatura.");
  }

  const Asignatura = mongoose.model("listaAsignatura", AsignaturaSchema);
  const User = mongoose.model("listaUsuario", userSchema);

  // Verificar si la asignatura existe
  const asignatura = await Asignatura.findById(asignaturaId);
  if (!asignatura) {
    throw new Error("La asignatura no existe.");
  }

  // Verificar si el usuario a añadir existe y es un alumno
  const alumno = await User.findById(alumnoId);
  if (!alumno || alumno.rol !== "alumno") {
    throw new Error("El usuario no es un alumno o no existe.");
  }

  // Verificar si el alumno ya está en la asignatura
  if (asignatura.listaAlumnos.includes(alumnoId)) {
    throw new Error("El alumno ya está en la asignatura.");
  }

  // Añadir el alumno a la asignatura
  asignatura.listaAlumnos.push(alumnoId);
  
  return await asignatura.save()
    .then(result => result)
    .catch(error => console.log(error));
};


userSchema.methods.addProfesorToAsignatura = async function (asignaturaId, profesorId) {
  if (this.rol !== "admin") {
    throw new Error("No tienes permisos para añadir profesores a una asignatura.");
  }

  const Asignatura = mongoose.model("listaAsignatura", AsignaturaSchema);
  const User = mongoose.model("listaUsuario", userSchema);

  // Verificar si la asignatura existe
  const asignatura = await Asignatura.findById(asignaturaId);
  if (!asignatura) {
    throw new Error("La asignatura no existe.");
  }

  // Verificar si el usuario a añadir existe y es un profesor
  const profesor = await User.findById(profesorId);
  if (!profesor || profesor.rol !== "profesor") {
    throw new Error("El usuario no es un profesor o no existe.");
  }

  // Verificar si el profesor ya está en la asignatura
  if (asignatura.listaProfesores.includes(profesorId)) {
    throw new Error("El profesor ya está en la asignatura.");
  }

  // Añadir el profesor a la asignatura
  asignatura.listaProfesores.push(profesorId);
  
  return await asignatura.save()
    .then(result => result)
    .catch(error => console.log(error));
};


userSchema.methods.getSoftwareDeAsignatura = async function (asignaturaId) {
  const Software = mongoose.model("listaSoftware", sofwareSchema);
  return await Software.find({ asignatura_id: asignaturaId })
    .then(result => result)
    .catch(error => console.log(error));
};


userSchema.methods.getDetallesSoftware = async function (softwareId) {
  const Software = mongoose.model("listaSoftware", sofwareSchema);
  return await Software.findById(softwareId)
    .then(result => result)
    .catch(error => console.log(error));
};


userSchema.methods.getAsignaturas = async function () {
  const Asignatura = mongoose.model("listaAsignatura", AsignaturaSchema);
  return await Asignatura.find({
    $or: [
      { listaAlumnos: this._id },
      { listaProfesores: this._id }
    ]
  })
    .then(result => result)
    .catch(error => console.log(error));
};


userSchema.methods.addSoftwareToAsignatura = async function (asignaturaId, softwareData) {
  const Asignatura = mongoose.model("listaAsignatura", AsignaturaSchema);
  const Software = mongoose.model("listaSoftware", sofwareSchema);
  // Verificar si el usuario es profesor de la asignatura
  const asignatura = await Asignatura.findOne({
    _id: asignaturaId,
    listaProfesores: this._id
  });

  if (!asignatura) {
    throw new Error("No tienes permisos para añadir software a esta asignatura.");
  }
  // Crear el software
  const nuevoSoftware = new Software({
    descripcion: softwareData.descripcion,
    link: softwareData.link,
    asignatura_id: asignaturaId
  });

  return await nuevoSoftware.save()
    .then(result => result)
    .catch(error => console.log(error));
};


userSchema.methods.removeSoftwareFromAsignatura = async function (softwareId) {
  const Software = mongoose.model("listaSoftware", sofwareSchema);
  const Asignatura = mongoose.model("listaAsignatura", AsignaturaSchema);
  // Obtener el software para ver a qué asignatura pertenece
  const software = await Software.findById(softwareId);
  if (!software) {
    throw new Error("El software no existe.");
  }
  // Verificar si el usuario es profesor de la asignatura relacionada
  const asignatura = await Asignatura.findOne({
    _id: software.asignatura_id,
    listaProfesores: this._id
  });

  if (!asignatura) {
    throw new Error("No tienes permisos para eliminar software de esta asignatura.");
  }
  // Eliminar el software
  return await Software.findByIdAndDelete(softwareId)
    .then(result => result)
    .catch(error => console.log(error));
};

