export const IS_DEV = import.meta.dev;
export const IS_PRERENDER = import.meta.prerender;
export const IS_CLIENT = import.meta.client; // import.meta.browser
export const IS_SERVER = import.meta.server; // import.meta.nitro

export const LOG_FRONTEND =
  JSON.parse(process.env.LOG_FRONTEND ?? 'false') ?? false;

if (IS_DEV) {
  console.log(
    `IS_DEV: ${IS_DEV} \nLOG_FRONTEND: ${LOG_FRONTEND} \nIS_PRERENDER: ${IS_PRERENDER} \nIS_CLIENT: ${IS_CLIENT} \nIS_SERVER: ${IS_SERVER}`
  );
}
