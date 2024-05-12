const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');
const axios = require('axios');

const comicsDirectory = path.resolve('public/Dilbert');
const comicsOutputFile = 'comics.json';
const repeatedWords = ['the', 'and', 'a', 'an', 'of', 'to', 'in', 'that', 'is', 'for', 'it', 'with', 'as', 'on', 'at', 'by'];
const dictionary = {
  'teh': 'the',
  'accomodate': 'accommodate',
  'seperation': 'separation',
  // add more corrections as needed
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processText(text) {
    console.log(`Processing text: ${text}`); // Output the text that's being processed

    const words = text
    .split(/\s+/) // Split the text into words based on one or more whitespace characters
    .filter(word => word.length >= 4); // Keep only words that are four or more characters long
  
    console.log(`Split into words: ${words}`); // Output the array of words

    const processedWords = [];

    for (let word of words) {
      console.log(`Processing word: ${word}`); // Output the word that's being processed

      let processedWord = await getSignificantWord(word);
      console.log(`Processed word: ${processedWord}`); // Output the processed word

      if (processedWord) {
        processedWords.push(processedWord);
      }

      await delay(200); // Delay of 200 milliseconds between requests
    }

    console.log(`Processed words: ${processedWords}`); // Output the array of processed words

    const result = processedWords.join(' ');
    console.log(`Result: ${result}`); // Output the final result

    return result;
}
  
async function getSignificantWord(word, depth = 0) {
    if (depth > 2) { // Limit the recursion to avoid too many API calls
        console.log(`Depth limit reached for word: ${word}`);
        return null;
    }

    console.log(`Checking word: ${word}`);

    // Check the significance of the word using detailed metadata
    let response = await axios.get(`https://api.datamuse.com/words?sp=${word}&md=d&max=1`);
    console.log(`Response for word check: ${JSON.stringify(response.data)}`);

    if (response.data.length && response.data[0].defs) {
        const definitions = response.data[0].defs.filter(def => def.startsWith('n\t')); // Filter for noun definitions
        if (definitions.length) {
            console.log(`Word is significant and correct: ${word}`);
            return word;
        }
    }

    // If the initial word isn't significant or clear, try suggesting a correction
    response = await axios.get(`https://api.datamuse.com/sug?s=${word}`);
    console.log(`Response for word suggestion: ${JSON.stringify(response.data)}`);

    if (response.data.length && response.data[0].word !== word) {
        const suggestedWord = response.data[0].word;
        console.log(`Suggested word: ${suggestedWord}`);

        // Recursively check the suggested word for significance
        return getSignificantWord(suggestedWord, depth + 1);
    }

    console.log(`No significant word found or suggestions are too similar for: ${word}`);
    return null;
}

async function createComicsJson(directory) {
    console.log("Scanning directory:", directory);
  
    const worker = await createWorker();
  
    async function readDirectory(dir, allComics) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
  
      for (const entry of entries) {
        if (entry.isDirectory()) {
          await readDirectory(path.join(dir, entry.name), allComics);
        } else if (entry.isFile() && entry.name.endsWith('.png')) {
          const fullPath = path.join(dir, entry.name);
          console.log(`Processing image: ${fullPath}`);
          try {
            const result = await worker.recognize(fullPath, {
              lang: 'eng',
              logger: 'console'
            });

            const text = result.data.text;
            const cleanedText = await processText(text);

            // const cleanedText = text
            //   .replace(/[^a-zA-Z\s]/g, '') // remove special characters
            //   .trim() // remove leading and trailing whitespace
            //   .replace(/\s+/g, ' ') // replace multiple spaces with a single space
            //   .toLowerCase() // convert to lowercase
            //   .split(' ') // split into individual words
            //   .filter(word => word.length > 3 && !repeatedWords.includes(word)) // remove short and repeated words
            //   .map(word => dictionary[word] || word) // perform spelling corrections
            //   .join(' '); // rejoin into a single string

            console.log(`Text recognized: ${cleanedText}`);
            if (text) {
              allComics.push({
                name: entry.name,
                path: fullPath,
                text: text.trim()
              });
            } else {
              console.log(`No text recognized for image: ${fullPath}`);
            }
          } catch (error) {
            console.error(`Error recognizing text for image: ${fullPath}`, error);
          }
        }
      }
    }
  
    let comics = [];
    await readDirectory(directory, comics);
    fs.writeFileSync(comicsOutputFile, JSON.stringify(comics, null, 2), 'utf8');
    console.log("Comics json file has been created successfully at:", path.resolve(comicsOutputFile));
    await worker.terminate();
  }

createComicsJson(comicsDirectory).catch(console.error);