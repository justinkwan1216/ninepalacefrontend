import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DataNode = ({ keyName, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    if (Array.isArray(value) || typeof value === 'object') {
      setIsOpen(!isOpen);
    }
  };

  const handleToggleVisible = () => {
    setIsVisible(!isVisible);
  };

  return isVisible ? (
    <div>
      <button onClick={handleToggleVisible}>Toggle Visibility</button>
      <div onClick={handleClick} style={{ cursor: 'pointer' }}>
        <strong>{keyName}:</strong> 
        {Array.isArray(value) || typeof value === 'object' ? (
          <span>{isOpen ? '▼' : '►'}</span>
        ) : null}
      </div>
      {isOpen && (
        <div style={{ marginLeft: 15 }}>
          {Array.isArray(value) ? (
            value.map((item, index) => <DataNode key={index} keyName={index.toString()} value={item} />)
          ) : (
            Object.entries(value).map(([key, val]) => <DataNode key={key} keyName={key} value={val} />)
          )}
        </div>
      )}
    </div>
  ) : (
    <button onClick={handleToggleVisible}>Show {keyName}</button>
  );
};

export const ObjectViewer = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('https://api.your-json-source.com/data');
      setData(response.data);
    };
    
    fetchData();
  }, []);

  return data ? (
    <div>
      {Object.entries(data).map(([key, value]) => (
        <DataNode key={key} keyName={key} value={value} />
      ))}
    </div>
  ) : <div>Loading...</div>;
};