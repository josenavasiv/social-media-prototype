/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	rootDir: './src',
	verbose: true,
	forceExit: true,
	moduleFileExtensions: ['ts', 'js', 'json'],
	maxWorkers: 1, // runs each test 1-by-1
};
