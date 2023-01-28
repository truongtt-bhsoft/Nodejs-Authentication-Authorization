require("dotenv").config();
const express = require("express");

require("./startup/logging")();
const app = express();
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Nodejs",
      description: "Expressjs swagger",
      contact: {
        name: "Truong",
      },
      servers: ["http://localhost:5000"],
    },
    securityDefinitions: {
      ApiKeyAuth: {
        type: "apiKey",
        name: "x-auth-token",
        in: "header",
      },
    },
    tags: [
      {
        name: "Users",
      },
      {
        name: "Auth",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

require("./startup/routes")(
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))
);
require("./startup/db")();

app.get("/test", (req, res) => {
  res.status(200).send("great");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
