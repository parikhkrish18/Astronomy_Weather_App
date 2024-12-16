import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './SearchBar.css';


// SearchBar component to display a search bar
const SearchBar = ({ value, onChange, onSubmit }) => {
  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search"
          value={value}
          onChange={onChange} 
        />
      </div>
      <div className="search-icon-container">
        <button type="submit">
          <FontAwesomeIcon icon={faSearch} size="lg"/>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
