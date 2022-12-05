// npm install @types/node; to allow intellisense for process
const EventEmitter = require("events");
const { stdin } = require("process");
const readline = require("readline");
const prompt = require("prompt-sync")({ sigint: true }); //sigint is required to allow exiting the process easily

// const name = prompt("What is your name?"); // always returns string, numbers must be parsed

// console.log(`Oh hi Mark... I mean, hi ${name}`);
class Field {
	constructor(arr) {
		this.xLen = arr[0].length;
		this.yLen = arr.length;
		this.arr = arr;
		this.holes = [];
		this.winConditions = [];
		arr.forEach((nestedArr, nestedI) =>
			nestedArr.forEach((e, i) => {
				if (e.toLowerCase && e.toLowerCase() === "o") {
					nestedArr[i] = "O";
					this.holes.push([i, nestedI]);
				} else if (e === "^" || e === "\x1b[33m^\x1b[0m") {
					nestedArr[i] = "\x1b[33m^\x1b[0m";
					this.winConditions.push([i, nestedI]);
				} else nestedArr[i] = "░";
			})
		);
		this.arr[0][0] = "*";
		this.player = {
			posX: 0,
			posY: 0,
		};
		this.playing = false;
	}
	printMap() {
		if (
			this.player.posY > this.yLen - 1 ||
			this.player.posY < 0 ||
			this.player.posX > this.xLen - 1 ||
			this.player.posX < 0
		) {
			f.playing = false;
			console.log(
				"You have lost! Fell into the abyss, broke every bone and was a wretch!\n"
			);
			prompt("Press any key to exit...");
			process.exit(1);
		}
		if (
			this.holes.some(
				(e) => e[0] === this.player.posX && e[1] === this.player.posY
			)
		) {
			f.playing = false;
			console.log(
				"You have lost! Fell into a smelly, hideous hole, the smell was so intense you lost consciousness immediately and become one with the smell. \n"
			);
			prompt("Press any key to exit...");
			process.exit(1);
		}
		if (
			this.winConditions.some(
				(e) => e[0] === this.player.posX && e[1] === this.player.posY
			)
		) {
			f.playing = false;
			console.log(
				"You have won! You exude virility, your testosterone levels are so high you would probably not pass an anti-doping test. YOU MAD LAD!  \n"
			);
			prompt("Press any key to exit...");
			process.exit(1);
		}

		this.arr.forEach((yArray, yPos) =>
			yArray.forEach((xEle, xPos) => {
				if (xEle === "\x1b[33m*\x1b[0m") this.arr[yPos][xPos] = "░";
			})
		);

		this.arr[this.player.posY][this.player.posX] = "\x1b[33m*\x1b[0m";
		this.arr.forEach((e) => {
			console.log(e.join(" ") + "\n");
		});
		console.log();
	}
	static generateMap(height = 10, width = 10, percentageOfHoles = 0.4) {
		const result = [];
		for (let y = 0; y < height; y++) {
			const nestedArr = [];
			for (let x = 0; x < width; x++) {
				// Logic that will generate every X field for every Y field
				nestedArr.push(["-"]);
			}
			result.push(nestedArr);
		}
		let holesRemaining = Math.floor(height * width * percentageOfHoles);
		const holes = [];
		while (holesRemaining > 0) {
			result.forEach((yArray, yIndex) =>
				yArray.forEach((xElement, xIndex) => {
					if (xIndex === 1 && yIndex === 0) return;
					if (xIndex === 0 && yIndex === 1) return;
					if (xIndex === 0 && yIndex === 0) return;
					if (holes.some((e) => e[0] === xIndex && e[1] === yIndex + 1)) return;
					if (holes.some((e) => e[0] === xIndex - 1 && e[1] === yIndex)) return;
					if (holesRemaining === 0) return;
					if (Math.random() > 0.5) {
						result[yIndex][xIndex] = "o";
						holesRemaining -= 1;
						holes.push([xIndex, yIndex]);
					}
				})
			);
		}
		result[0][0] = "*";
		let assignedWinCondition = false;

		while (!assignedWinCondition) {
			if (
				result[Math.floor(Math.random() * height)][
					Math.floor(Math.random() * width)
				] !== "o"
			) {
				result[Math.floor(Math.random() * height)][
					Math.floor(Math.random() * width)
				] = "\x1b[33m^\x1b[0m";
				assignedWinCondition = true;
			}
		}

		return result;
	}
}

const f = new Field(Field.generateMap(10, 10, 0.5));

let start;
while (start?.toLowerCase() !== "n" && start?.toLowerCase() !== "y") {
	start = prompt("Welcome! Start the game? (y/n) ");
}
if (start.toLowerCase() === "n") {
	prompt("Press any key to exit...");
	process.exit(1);
}
console.log("\nStarting...\n");

const clearLastLine = () => {
	readline.moveCursor(process.stdout, 0, -1); // up one line
	readline.clearLine(process.stdout, 1); // from cursor to end
};

f.playing = true;

while (f.playing) {
	f.printMap();
	const move = prompt(
		"Move with WASD, jump by pressing adding a SPACE before to WASD => "
	);
	switch (move.charAt(0).toLowerCase()) {
		case "w":
			f.player.posY -= 1;
			break;
		case "a":
			f.player.posX -= 1;
			break;
		case "s":
			f.player.posY += 1;
			break;
		case "d":
			f.player.posX += 1;
			break;
		case " ":
			switch (move.charAt(1).toLowerCase()) {
				case "w":
					f.player.posY -= 2;
					break;
				case "a":
					f.player.posX -= 2;
					break;
				case "s":
					f.player.posY += 2;
					break;
				case "d":
					f.player.posX += 2;
					break;
				default:
					break;
			}
			break;
		default:
			break;
	}
	for (let i = 0; i < f.yLen * 2 + 2; i++) {
		clearLastLine();
	}
}
