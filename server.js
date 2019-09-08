require('dotenv').config(); 
require('./database.js');
const app = require("./app.js");

PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});