import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ServerApiVersion } from 'mongodb';

const app = express()
const PORT = process.env.PORT || 3000; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, 'public')));

app.use(express.json()); 



app.get('/', (req, res) => {
  res.send('Hello Express from Render 😍😍😍. <a href="barry">barry</a>')
})

// endpoints

// send an html file
app.get('/barry', (req, res) => {
 
  res.sendFile(join(__dirname, 'public', 'barry.html')) 

})

app.get('/api/barry', (req, res) => {

  const myVar = 'Hello from server!';
  res.json({ myVar });
})

app.get('/api/query', (req, res) => {

  const name = req.query.name; 
  res.json({"message": `Hi, ${name}. How are you?`});

});

app.get('/api/url/:iaddasfsd', (req, res) => {

  console.log("client request with URL param:", req.params.iaddasfsd); 
 

});


app.get('/api/body', (req, res) => {

  console.log("client request with POST body:", req.query); 
  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
