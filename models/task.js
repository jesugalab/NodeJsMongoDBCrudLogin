const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = Schema({
  title: {
    type: String,
    required: true
},

  description: {
    type: String,
    required: true
},
  status: {
    type: Boolean,
    default: false
  },
  usuario: [
    {type: mongoose.Schema.Types.ObjectId, ref:'user'}
]
});


TaskSchema.methods.findAll= async function (usuario) {
  const Task = mongoose.model("tasks", TaskSchema);
  return await Task.find({'usuario':usuario}) 
  .then(result => {return result})
  .catch(error => console.log(error));
};

TaskSchema.methods.insert= async function () {
  //await this.save();
  await this.save()
  .then(result => console.log(result))
  .catch(error => console.log(error));
};

TaskSchema.methods.update= async (id, task) => {
  const Task = mongoose.model("tasks", TaskSchema);
  await Task.updateOne({_id: id}, task)
  .then(result => console.log(result))
  .catch(error => console.log(error));
};

TaskSchema.methods.delete= async function (id) {
  const Task = mongoose.model("tasks", TaskSchema);
  await Task.deleteOne({_id: id})
  .then(result => console.log(result))
  .catch(error => console.log(error));
};

TaskSchema.methods.findById= async function (id) {
  const Task = mongoose.model("tasks", TaskSchema);
  return await Task.findById(id)
  .then(result => {return result})
  .catch(error => console.log(error));
};

TaskSchema.methods.findSearch= async function (search, usuario) {
  const Task = mongoose.model("tasks", TaskSchema);
  return await Task.find({'title' : new RegExp(search, 'i'),'usuario': usuario})
  .then(result => {return result})
  .catch(error => console.log(error));
};


module.exports = mongoose.model('tasks', TaskSchema);
