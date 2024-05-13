import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './SearchBar';
import Results from './Results';
import Modal from 'react-modal';
import comicsData from './comics.json';

Modal.setAppElement('#root'); // Set the app element for React Modal

function App() {
  const [comicIndex, setComicIndex] = useState(0);
  const [comics, setComics] = useState(comicsData);
  const [filteredComics, setFilteredComics] = useState(comicsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedComic, setSelectedComic] = useState(null);

  useEffect(() => {
    if (comicsData.length > 0) {
      setComicIndex(0); // Ensure we set to the first comic initially
    }
  }, []);

  const nextComic = () => {
    setComicIndex((prevIndex) =>
      prevIndex < filteredComics.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const prevComic = () => {
    setComicIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredComics(comics);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const results = comics.filter((comic) =>
      comic.text.toLowerCase().includes(lowerQuery)
    );
    setFilteredComics(results);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredComics(comics);
  };

  const handleOpenModal = (comic) => {
    setSelectedComic(comic);
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Comic Viewer</h1>
        {comics.length > 0 ? (
          <>
            <img
              src={comics[comicIndex].path}
              alt="Comic"
            />
            <div>
              <button onClick={prevComic}>Previous</button>
              <button onClick={nextComic}>Next</button>
            </div>
            <SearchBar onSearch={handleSearch} />
            <button onClick={clearSearch}>Clear</button>
            {filteredComics.length > 0 && filteredComics !== comics && (
              <Results comics={filteredComics} onOpenModal={handleOpenModal} />
            )}
          </>
        ) : (
          <p>Loading comics...</p>
        )}
      </header>
      <Modal isOpen={isOpen} onRequestClose={handleCloseModal}>
        {selectedComic && (
          <>
            <img
              src={selectedComic.path}
              alt="Comic"
              style={{ width: '100%', height: '100%' }}
            />
            <p>{selectedComic.text}</p>
          </>
        )}
      </Modal>
    </div>
  );
}

export default App;