// SearchBar.js
import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [input, setInput] = useState('');

  const handleChange = (event) => {
    setInput(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSearch(input);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search for comics..."
        value={input}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      <button onClick={() => onSearch(input)}>Search</button>
    </div>
  );
}

export default SearchBar;
