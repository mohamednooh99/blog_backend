require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const usersRouter = require("./routes/users.routes");
const postsRouter = require("./routes/posts.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

mongoose
  .connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((err) => {
    console.error("Connection error", err);
  });

app.use("/api/auth", authRoutes);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);

app.listen(port, () => {
  console.log("run node js with framework express");
});
