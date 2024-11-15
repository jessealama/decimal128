// @ts-check
import typescript from "@rollup/plugin-typescript";

/**
 * @param {'esm' | 'cjs'} format
 * @returns { import("rollup").RollupOptions }
 */
const createConfig = (format) => {
    const extension = format === "esm" ? "mjs" : "cjs";
    return {
        input: "src/Decimal128.mts",
        output: [
            {
                sourcemap: true,
                interop: "esModule",
                preserveModules: true,
                dir: `./dist/${format}`,
                format: format,
                entryFileNames: `[name].${extension}`,
            },
        ],
        plugins: [
            typescript({
                tsconfig: "tsconfig.build.json",
                outDir: `dist/${format}`,
                sourceMap: false,
            }),
        ],
    };
};

/**
 * @type { import("rollup").RollupOptions[] }
 */
const config = [createConfig("esm"), createConfig("cjs")];

export default config;
