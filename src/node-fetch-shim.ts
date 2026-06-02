// Browser shim for node-fetch required inside the bundled TF.js dependency.
// The browser has native fetch; this re-exports it so the CJS require() resolves.
export default globalThis.fetch.bind(globalThis);
export const {Headers, Request, Response} = globalThis;
