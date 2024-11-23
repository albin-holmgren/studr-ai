const { createRequestHandler } = require("@remix-run/vercel");
const build = require("./build");

module.exports = createRequestHandler({ build, mode: process.env.NODE_ENV });
