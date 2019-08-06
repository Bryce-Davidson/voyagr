require('dotenv').config(); 

const app = require("./app.js");

PORT = process.env.PORT || 4000;

// MONGO DATABASE
require('./database.js');

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});