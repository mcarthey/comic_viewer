import React, { useState } from 'react';
import './App.css';

function App() {
  const [comicIndex, setComicIndex] = useState(0);
  const comics = [
    'Dilbert/1989/1989-04-16_dog_brain_animals.png',
    'Dilbert/1989/1989-04-17_dating_ice cream_relationships.png',
    'Dilbert/1989/1989-04-18_homeless persons_real estate_less fortunate.png'
  ];

  const nextComic = () => {
    if (comicIndex < comics.length - 1) {
      setComicIndex(comicIndex + 1);
    }
  };

  const prevComic = () => {
    if (comicIndex > 0) {
      setComicIndex(comicIndex - 1);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Comic Viewer</h1>
        <img src={comics[comicIndex]} alt="Comic" />
        <div>
          <button onClick={prevComic}>Previous</button>
          <button onClick={nextComic}>Next</button>
        </div>
      </header>
    </div>
  );
}

export default App;
