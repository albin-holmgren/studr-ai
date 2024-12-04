import * as build from './build/index.js';// Import default export from index.js
import { createRequestHandler } from '@remix-run/vercel';

export default createRequestHandler({ build });