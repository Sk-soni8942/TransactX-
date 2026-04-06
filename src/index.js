import ConnectDb from "./db/index.js";
import app from "./app.js";
ConnectDb()
  .then(() => {
    app.on("error", () => {
      console.log("express Error");
      throw Error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port number ${process.env.PORT}`);
    });
  })
  .catch(() => {
    console.log("Connection Failed !!");
  });
