import * as fs from "fs";
import * as path from "path";

function readFileContents(filePath: string): string {
	return fs.readFileSync(filePath, "utf-8");
}

function processDirectory(dirPath: string, outputString: string): string {
	const files = fs.readdirSync(dirPath);

	for (const file of files) {
		const filePath = path.join(dirPath, file);
		const stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			outputString = processDirectory(filePath, outputString);
		} else {
			const fileContents = readFileContents(filePath);
			outputString += `File: ${filePath}\n\n${fileContents}\n\n`;
		}
	}

	return outputString;
}

function main(inputFolder: string, outputFile: string): void {
	const outputString = processDirectory(inputFolder, "");

	fs.writeFileSync(outputFile, outputString);

	console.log(`Contents saved to ${outputFile}`);
}

const args = process.argv.slice(2);

if (args.length !== 2) {
	console.log("Usage: node concatenateContents.js <inputFolder> <outputFile>");
	process.exit(1);
}

const inputFolder = args[0];
const outputFile = args[1];

main(inputFolder, outputFile);
