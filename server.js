require('dotenv').config(); 
require('./database.js');
const app = require("./app.js");

PORT = process.env.PORT || 4000;

// ERROR HANDELING ------------------------------------------

app.use(function mongoErrors(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.name === 'MongoError') {
    return res.send({name: err.name, message: err.errmsg})
  }
  else next();
});

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});