import http from "http";
import fs from "fs";

const PORT = 3000;

const server = http.createServer((request, response) => {
  const log = `${request.url}`;
  fs.appendFileSync("log.txt", log, () => {
    switch (request.url) {
      case "/":
        response.end({
          status: 200,
          success: true,
          error: null,
          data: "homepage",
        });
        break;
      case "/about":
        response.end({
          status: 200,
          success: true,
          error: null,
          data: "about page",
        });
        break;
      case "/users":
        response.end({
          status: 200,
          success: true,
          error: null,
          data: "user page",
        });
        break;
      default:
        response.end({
          status: 404,
          success: false,
          error: 404,
          data: "Error page",
        });
    }
  });
});

server.listen(PORT, () => {
  console.log(`server is running at port: ${PORT}`);
});

// const http = require("http");
// const fs = require("fs");

// const myServer = http.createServer((request, response) => {
//   const log = `${Date.now()}:New request Received - ${request.headers.host}${request.url} \n`;
//   fs.appendFile("log.txt", log, () => {
//     switch (request.url) {
//       case "/":
//         response.end("Homepage");
//         break;
//       case "/about":
//         response.end("About page");
//         break;
//       default:
//         response.end("404 Not Found");
//     }
//     // response.end("hello from server");
//   });
// });

// myServer.listen(3000, () => {
//   console.log("server started");
// });
