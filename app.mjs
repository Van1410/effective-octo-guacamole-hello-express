import express from 'express'
import path from 'path';

const app = express()
const PORT = process.env.PORT || 3000; 


app.use(express.static(path.join(__dirname, 'public')))



app.get('/', (req, res) => {
  res.send('Hello Express  . <a href="Van">Van</a>')
})

// endpoints...middlewares...apis? 
// send an html file

app.get('/barry', (req, res) => {
  // res.send('barry. <a href="/">home</a>')

  res.sendFile('Van.html'); 

})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
