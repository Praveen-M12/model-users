const express = require('express');
const colors = require('colors')
const sequelize = require('./config/database');
const User = require('./models/user');
const userRoutes = require('./routes/userRoutes.js');


const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/', (req, res)=>{
    res.send("Welcome to our Page!!")
})

// Check if the database is connected
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.'.green);
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`.bgBlue.white);
});
