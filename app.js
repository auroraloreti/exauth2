const express = require('express');
const dotenv = require('dotenv');
const usersRoute = require('./routes/users');

dotenv.config();

const app = express();
app.use(express.json()); 

app.use('/users', usersRoute); 


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});