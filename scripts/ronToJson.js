const fs = require("fs");
const rimraf = require("rimraf");
const readline = require("readline");

// (
// name: "Chainmail Gloves S",
// skills: [(Botanist, 1), (DefenseBoost, 2)],
// slots: [1, 1],
// rare: 4,
// defense: 32,
// fire: 0,
// water: 0,
// thunder: 1,
// ice: 0,
// dragon: 0,
// gender: Neutral,
// ),

// =>

// {
// "name": "Chainmail Gloves S",
// "skills": {"Botanist": 1, "DefenseBoost": 2},
// "slots": [1, 1],
// "rare": 4,
// "defense": 32,
// "fire": 0,
// "water": 0,
// 'thunder': 1,
// "ice": 0,
// "dragon": 0,
// "gender": "Neutral",
// },

/**
 * Couldn't find a way to use Rust to convert to JSON, do this literally
 * @param {string} input
 */
function convertLine(input) {
  const line = input.trim();
  if (line.startsWith("(")) {
    return line.replace("(", "{");
  } else if (line.startsWith(")")) {
    return line.replace(")", "}");
  } else if (line.startsWith("skills")) {
    const prefix = `"skills": {`;

    const skills = line.match(/(\(\w+\,\s\d\))/gi);

    if (skills) {
      const mappedSkills = skills.map((item) =>
        item.replace(/\((\w+)\,\s(\d)\)/i, `"$1": $2`)
      );

      return prefix + mappedSkills.join(", ") + "},";
    } else {
      return `"skills": {},`;
    }
  } else if (line.startsWith("gender")) {
    // Some gender line ends with ',' but json doesn't support trailing comma
    return line.replace(/(\w+)\:\s(\w+)\,?/i, `"$1": "$2"`);
  } else {
    return line.replace(/(\w+)\:/i, `"$1":`);
  }
}

async function processLineByLine(fileName = "test") {
  const inputFileStream = fs.createReadStream(fileName + ".ron");
  const outputFileStream = fs.createWriteStream("json/" + fileName + ".json", {
    flags: "w", // 'a' means appending (old data will be preserved)
  });

  const rl = readline.createInterface({
    input: inputFileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    outputFileStream.write(convertLine(line));
  }

  inputFileStream.close();
  outputFileStream.close();
}

const allFiles = ["arms", "chests", "helmets", "legs", "waists"];

rimraf.sync("./json");
if (!fs.existsSync("json")) {
  fs.mkdirSync("json");
}

// processLineByLine(); // test
allFiles.forEach((f) => processLineByLine(f));
