const express = require('express')
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(__dirname + '/ressources'));




app.get('/', (request, res) => {
  res.sendFile(path.join(__dirname+'/main.html'));
})

app.get('/map', (request, res) => {
  res.sendFile(path.join(__dirname+'/map.html'));
})

app.get('/stacked', (request, res) => {
  res.sendFile(path.join(__dirname+'/stacked.html'));
})


app.get('/circle', (request, res) => {
  res.sendFile(path.join(__dirname+'/aster.html'));
})

app.get('/aster', (request, res) => {
  res.sendFile(path.join(__dirname+'/circle-test.html'));
})

app.get('/test', (request, res) => {
  res.sendFile(path.join(__dirname+'/test.html'));
})







app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})