export default {
  serverBuildTarget: 'vercel',
  server: './server.js',
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build', // Ensure this is correct
  publicPath: '/build/', // Ensure this is correct
  serverBuildPath: 'build/index.js', // Adjust this to where your server build is generated
  devServerPort: 8002,
};