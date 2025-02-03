const express = require('express');
const router = express.Router();
const Task = require('../models/task');


router.get('/tasks',isAuthenticated, async (req, res) => {
  const task = new Task();
  const tasks = await task.findAll(req.user._id);
  res.render('tasks', {
    tasks
  });
});

router.post('/tasks/add', isAuthenticated,async (req, res, next) => {
  const task = new Task(req.body);
  task.usuario=req.user._id;
  await task.insert();
  res.redirect('/tasks');
});

router.get('/tasks/turn/:id',isAuthenticated, async (req, res, next) => {
  let { id } = req.params;
  const task = await Task.findById(id);
  task.status = !task.status;
  await task.insert();
  res.redirect('/tasks');
});


router.get('/tasks/edit/:id', isAuthenticated, async (req, res, next) => {
  var task = new Task();
  task = await task.findById(req.params.id);
  res.render('edit', { task });
});

router.post('/tasks/edit/:id',isAuthenticated, async (req, res, next) => {
  const task = new Task();
  const { id } = req.params;
  await task.update({_id: id}, req.body);
  res.redirect('/tasks');
});

router.get('/tasks/delete/:id', isAuthenticated,async (req, res, next) => {
  const task = new Task();
  let { id } = req.params;
  await task.delete(id);
  res.redirect('/tasks');
});

router.get('/tasks/search',isAuthenticated, async (req, res, next) => {
  const task = new Task();
  let search = req.query.search;
  const tasks = await task.findSearch(search, req.user._id);
  res.render('tasks', {
    tasks
  });
});


function isAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }

  res.redirect('/')
}
module.exports = router;
