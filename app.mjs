//imports go up top
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()
const PORT = process.env.PORT || 3000; 

app.use(express.static(join(__dirname, 'public')));

app.get('/barry', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'barry.html')) 
})

app.get('/', (req, res) => {
  res.send('Hello Express from Render 😍😍😍. <a href="barry">barry</a>')
})


app.get('/barry', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'barry.html')); 
})

app.get('/api/barry', (req, res) => {
  // res.send('barry. <a href="/">home</a>')
  const myVar = 'Hello from server!';
  res.json({ myVar });
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})