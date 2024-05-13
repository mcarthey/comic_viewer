import React, { useState } from 'react';
import Modal from 'react-modal';
import { fadeIn, fadeOut } from 'react-modal';

function Results({ comics }) {
  const [selectedComic, setSelectedComic] = useState(null);

  return (
    <div>
      <h2>Search Results:</h2>
      {comics.map((comic, index) => (
        <div key={index} style={{ margin: '10px', cursor: 'pointer' }}>
          <img
            src={comic.path}
            alt={comic.name}
            style={{ width: '600px', height: 'auto' }}
            onClick={() => setSelectedComic(comic)}
          />
          <p style={{ fontSize: 14 }}>{comic.text}</p>
        </div>
      ))}
      <Modal
        isOpen={selectedComic !== null}
        onRequestClose={() => setSelectedComic(null)}
        animation={fadeIn} // Add animation
        backgroundColor='rgba(0, 0, 0, 0.5)' // Add transparent background
        center={true} // Center the modal
      >
        {selectedComic && (
          <>
            <img src={selectedComic.path} alt="Comic" />
            <p>{selectedComic.text}</p>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Results;