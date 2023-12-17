import React, { useState } from 'react';
import './App.css';
import { interpretComments, isConfigured } from './openai-comments-aggregator.js';

function displayResults(results) {
  const numCommentsDiv = document.createElement('div');
  numCommentsDiv.textContent = `Number of Comments: ${results.numComments}`;
  numCommentsDiv.appendChild(document.createElement('br'));
  numCommentsDiv.appendChild(document.createElement('br'));

  const summaryDiv = document.createElement('div');
  summaryDiv.innerHTML = `${results.summary}`;

  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = '';
  outputDiv.appendChild(numCommentsDiv);
  outputDiv.appendChild(summaryDiv);
}

function App() {
  const [cursorStyle, setCursorStyle] = useState('default');

  if (isConfigured() === false) {
    return (<body>Key and/or endpoint not configured for cognitive services!</body>)
  }

  return (
    <div className="App" style={{ cursor: cursorStyle }}>
      <header className="App-header">
        <p>AI Comments Aggregator</p>
      </header>
      <div>
        <p>Insert URL pointing to the comments section on the B92 site:</p>
        <input
          type="text"
          id="comments-url"
          placeholder="Enter URL to comments section on the B92 site"
        />
        <div className="button-container">
          <button
            id="aggregate-button"
            onClick={() => {
              setCursorStyle('wait');
              const commentsURL = document.getElementById("comments-url").value;
                interpretComments(commentsURL)
                .then(response => {
                  displayResults(response);
                  setCursorStyle('default');
                });
            }}
          >
            Aggregate</button>
        </div>
        <hr />
        <div id="output" />
      </div>
    </div>
  );
}

export default App;