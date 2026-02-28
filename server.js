require('dotenv').config()
const app = require("./src/app");
const connectDB=require("./src/config/db")

connectDB()
const port = 3000;

app.listen(port, () => {
  console.log("Server is running on 3000 port");
});
