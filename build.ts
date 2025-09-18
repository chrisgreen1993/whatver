import { rm } from "node:fs/promises";
import dts from "bun-plugin-dts";

await rm("./dist", { recursive: true, force: true });

const cliOutput = await Bun.build({
	entrypoints: ["./src/cli.ts"],
	target: "node",
	outdir: "./dist",
});

console.log(`✅ ${cliOutput.outputs[0]?.path}`);

const libOutput = await Bun.build({
	entrypoints: ["./src/index.ts"],
	target: "node",
	outdir: "./dist",
	plugins: [dts()], // generate an index.d.ts
});

console.log(`✅ ${libOutput.outputs[0]?.path}`);
