const router = require('express').Router();
const passport = require('passport');



// Middleware isAuthenticated definido directamente aquí
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { // Verifica si el usuario está autenticado
    return next(); // Si está autenticado, continúa con la siguiente función
  }
  res.redirect('/'); // Si no está autenticado, redirige al inicio
};


router.get('/', (req, res, next) => {
  res.render('signin');
});

router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/signup',
  failureRedirect: '/signup',
  failureFlash: true
})); 

router.get('/signin', (req, res, next) => {
  res.render('signin');
});


router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/profile',
  failureRedirect: '/signin',
  failureFlash: true
}));

router.get('/profile',isAuthenticated, (req, res, next) => {
  res.render('profile');
});

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  }); 
});

/*
router.get('/signupEstudio', (req, res, next) => {
  res.render('signupEstudio', {
      signupMessage: req.flash('signupMessage')
  });
});

router.post('/signupEstudio', (req, res, next) => {
  const { nombre, tipo} = req.body;

  // Validar que todos los campos requeridos estén presentes
  if (!nombre || !tipo) {
      req.flash('signupMessage', 'Por favor, completa todos los campos.');
      return res.redirect('/signupEstudio'); // Redirigir de vuelta al formulario con mensaje
  }

  // Si la validación es exitosa, proceder con la autenticación
  passport.authenticate('local-signupEstudio', {
      successRedirect: '/profile',
      failureRedirect: '/signupEstudio',
      failureFlash: true
  })(req, res, next);
});




function isAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }

  res.redirect('/')
}
*/
module.exports = router;
