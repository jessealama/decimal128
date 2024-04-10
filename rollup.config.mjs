// @ts-check
import typescript from "@rollup/plugin-typescript";

/**
 * @type { import("rollup").OutputOptions }
 */
const commonOutput = {
    sourcemap: true,
    interop: "esModule",
};

/**
 * @type { import("rollup").RollupOptions }
 */
const config = {
    input: "src/decimal128.mts",
    output: [
        {
            ...commonOutput,
            file: "./dist/decimal128.mjs",
            format: "esm",
        },
        {
            ...commonOutput,
            file: "./dist/decimal128.cjs",
            format: "cjs",
        },
    ],
    plugins: [
        typescript({
            tsconfig: "tsconfig.build.json",
            outDir: "dist",
            sourceMap: false,
        }),
    ],
};

export default config;
