const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');
const axiosBase = require('axios');
const { setupCache } = require('axios-cache-interceptor');

// Setup Axios with caching
const axios = setupCache(axiosBase, {
    ttl: 15 * 60 * 1000, // Cache for 15 minutes
});

const levenshtein = require('fast-levenshtein');

const comicsDirectory = path.resolve('public/Dilbert');
const comicsOutputFile = 'comics.json';
const debug = false; // Set to true for debugging, false for general running

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processText(text) {
    if (debug) console.log(`Processing text: ${text}`); // Output the text that's being processed

    const words = text
    .split(/\s+/) // Split the text into words based on one or more whitespace characters
    .filter(word => word.length >= 4); // Keep only words that are four or more characters long
  
    console.log(`Split into words: ${words}`); // Output the array of words

    const processedWords = [];

    for (let word of words) {
        if (debug) console.log(`Processing word: ${word}`); // Output the word that's being processed

      let processedWord = await getSignificantWord(word);
      if (debug) console.log(`Processed word result: ${processedWord}`); // Output the processed word

      if (processedWord) {
        processedWords.push(processedWord);
      }

      await delay(200); // Delay of 200 milliseconds between requests
    }

    if (debug) console.log(`Processed words: ${processedWords}`); // Output the array of processed words

    const result = processedWords.join(' ');
    if (debug) console.log(`Result: ${result}`); // Output the final result

    return result;
}
  
async function getSignificantWord(word, depth = 0) {
    // Base case to prevent infinite recursion
    if (depth > 2) {
        console.log(`Depth limit reached for word: ${word}`);
        return word;
    }

    let response = await axios.get(`https://api.datamuse.com/words?sp=${word}&md=d`);
    if (debug) console.log(`Response for word check: ${JSON.stringify(response.data)}`);

    // Check if the first response is significant
    if (response.data.length && response.data[0].defs) {
        const definitions = response.data[0].defs.filter(def => def.startsWith('n\t')); // Filter for noun definitions
        if (definitions.length) {
            var correctedWord = response.data[0].word;
            if (debug) console.log(`Word is significant and correct: ${correctedWord}`);
            return correctedWord;
        }
        else {
            if (debug) console.log(`Word is significant but not a noun: ${word}`);
            return null;
        }
    }

    // If the initial word isn't significant or clear, try suggesting a correction
    response = await axios.get(`https://api.datamuse.com/sug?s=${word}`);
    if (debug) console.log(`Response for word suggestion: ${JSON.stringify(response.data)}`);

    if (response.data.length) {
        const suggestedWord = response.data[0].word;
        const distance = levenshtein.get(word.toLowerCase(), suggestedWord.toLowerCase());
        if (debug) console.log(`Suggested word: ${suggestedWord} with distance: ${distance}`);

        // if suggested word is the same as the original word, return the original word
        if (distance === 0) {
            return suggestedWord;
        }
        
        if (distance <= 1) {
            return getSignificantWord(suggestedWord, depth + 1);
        }
    }

    // Return empty if no suitable suggestion was found
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

            console.log(`Text recognized: ${cleanedText}`);
            if (cleanedText) {
              allComics.push({
                name: entry.name,
                path: fullPath,
                text: cleanedText.trim()
              });
              fs.writeFileSync(comicsOutputFile, JSON.stringify(allComics, null, 2), 'utf8');
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
    console.log("Comics json file has been created successfully at:", path.resolve(comicsOutputFile));
    await worker.terminate();
  }

createComicsJson(comicsDirectory).catch(console.error);