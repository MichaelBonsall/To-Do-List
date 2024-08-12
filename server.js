const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express(); 
const path = require('path');
const me = require('mustache-express');

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('public', __dirname + "/public")

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())

app.use(bodyParser.urlencoded({ extended: true }));

const url = 'mongodb://localhost:27017/myDatabase';

mongoose.connect(url)
    .then(() => {
        console.log('Successful connection to server');
  })
    .catch(err => {
        console.error('Connection error', err);
});


const schema = new mongoose.Schema({
    _id: Number,
    task: String,
    status: Boolean,
})

const model = mongoose.model('model', schema);


app.post('/add', async (req, res) => {
  const rq = req.body.task;
  try {
      const jank = new Date().getTime() //using date().getTime() to generate a unique number to use for ID. This returns ms so it's not feasible to get a duplicate
      await model.create({_id: parseInt(jank), task: rq, status: false})
      res.status(200).send('Task added successfully')
    } catch (err) {
      console.error(err);
      res.status(500).send('Error saving data');
  }
});

app.patch('/modify', async(req, res) =>{
  const id = req.body._id
  const newTask = req.body.task
  try{
    await model.findOneAndUpdate({_id: id}, { $set: {task: newTask, status:false }})
    res.status(200).send('Task modified successfully')
  } catch (err){
    console.error(err);
    res.status(500).send('Error modifying data')
  }

})

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await model.find({});
    console.log(tasks)
    res.json(tasks);
    console.log("Tasks retrieved successfully")
  } catch (err) {
    res.status(500).send('Error retrieving tasks');
  }
});

app.delete('/delete', async (req, res) => {
  const id = req.body._id;
  try {
    await model.findOneAndDelete({ _id: id });
    res.status(200).send('Task deleted successfully')
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting data');
  }
});

app.patch('/finish', async(req, res) =>{
  try{
    await model.findOneAndUpdate({_id: parseInt(req.body._id, 10)}, {$set: {status: true}})
    res.status(200).send('Task marked as finished')
  } catch(err){
    console.error(err)
    res.status(500).send('Error marking todo item as complete')
  }
})
app.listen(process.env.PORT || 3000, () => console.log("App running on http://localhost:3000"));