import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "./index.js",
            name: "",
            formats: ["es", "cjs"],
            fileName: (format) => format === 'es' ? `data-view.js` : 'data-view.cjs',
        },
        outDir: "./dist/",
        emptyOutDir: true,
    },
});
