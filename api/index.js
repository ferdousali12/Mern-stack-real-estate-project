import express from "express";
import mongoose from 'mongoose';


const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/estate')
  .then(() => console.log('Connected to estate DB!'))
  .catch(err => console.error('Connection error:', err));


app.listen(3000, () => {
  console.log("the server  is  on the 3000 port");
});
