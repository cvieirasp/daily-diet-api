import app from "./app";

app
  .listen({
    port: 3000,
  })
  .then(() => {
    console.log("Server is running on http://localhost:3000");
  });
