/**
 * This file allows Vite to serve files from upper directories. You can ignore this
 * file if you are not using Vite or you are using the app from a hosted version.
 *
 * @see https://vitejs.dev/config/#server-fs-strict
 */
module.exports = {
    server: {
        fs: { strict: false },
    },
};
