const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  var userRep = new User();
  userRep = await userRep.findEmail( email)
  if(userRep) {
    return done(null, false, req.flash('signupMessage', 'Error de Autentificacion.'));
  } else {
    const { nombre, apellidos, rol } = req.body; // Extraer de req.body
    const newUser = new User();
    newUser.email = email;
    newUser.nombre = nombre;
    newUser.apellidos = apellidos;
    newUser.rol = rol;
    newUser.password = newUser.encryptPassword(password);
    await newUser.insert()
  .then(result => console.log(result))
  .catch(error => console.log(error));
    done(null, req.user, req.flash('signupMessage',  'Error de Autentificacion.')); // es mantiene en la misma pagina
  }
}));

passport.use('local-signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  var user = new User();
    user = await user.findEmail( email);
  if(!user) {
    return done(null, false, req.flash('signinMessage', 'No User Found'));
  }
  if(!user.comparePassword(password)) {
    return done(null, false, req.flash('signinMessage', 'Incorrect Password'));
  }
  return done(null, user);
}));
