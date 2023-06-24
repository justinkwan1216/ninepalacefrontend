import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faDownload, faFileImport, faFileExport } from '@fortawesome/free-solid-svg-icons';


import './App.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      year: '',
      month: '',
      day: '',
      byear: '',
      bmonth: '',
      bday: '',
      jaxi: '',
      jahao: '',
      lastname: '',
      firstname: '',
      results: {},
      show: [],
	  layout: this.getFromLS('layout') || [],
	  layoutKey: Math.random(),
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleShow = this.toggleShow.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }
	 // Function to save to localStorage
    saveToLS = (key, value) => {
    if (localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
  
    // Function to load from localStorage
getFromLS = (key) => {
  if (localStorage) {
    if (localStorage.getItem(key)) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch(e) {
        /* Ignore */
      }
    }
  }
  return [];  // return an empty array when there's nothing in localStorage
}
  

onLayoutChange = (layout) => {
  this.setState({ layout });
  this.saveToLS('show', this.state.show);
}

 handleSave = () => {
  this.saveToLS('layout', this.state.layout);
  this.saveToLS('results', this.state.results);
  this.saveToLS('show', this.state.show);
}

handleLoad = () => {
  const layout = this.getFromLS('layout') || [];
  const results = this.getFromLS('results') || {};
  const show = this.getFromLS('show') || Array(Object.keys(results).length).fill(false);
  this.setState({ 
    layout, 
    results,
    show,
    layoutKey: Math.random() // Changing key to a new random number
  });
}
// Function to handle layout export
handleExport = () => {
  const stateToExport = {
    layout: this.state.layout,
    show: this.state.show
  };
  const blob = new Blob([JSON.stringify(stateToExport, null, 2)], { type: 'text/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'layout.json';
  link.click();
}

// Function to handle layout import
handleImport = (event) => {
  const fileReader = new FileReader();
  fileReader.onloadend = () => {
    try {
      const importedState = JSON.parse(fileReader.result);
      this.setState({ 
        layout: [...importedState.layout], // create new object
        show: [...importedState.show],
        layoutKey: Date.now() // use the current time as key
      });
    } catch(e) {
      console.error("Error when loading file", e);
    }
    // Reset the value of the file input to ensure the next selection triggers a "change" event
    event.target.value = null;
  };
  fileReader.readAsText(event.target.files[0]);
}

  handleInputChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    // Make a POST request to the server
    let response = await fetch('https://nine-palace.onrender.com:443/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state),
    });

    // Get the result from the server
    let results = await response.json();

   // Try to load the layout from localStorage
    let layout = this.getFromLS('layout');
  // If there's no saved layout in localStorage, create a new one
  if (layout.length === 0) {
    layout = Object.keys(results).map((key, i) => ({
      i: i.toString(),
      x: i * 2 % 12,
      y: Math.floor(i / 6) * 2,
      w: 6,
      h: 2,
    }));
  }

	 const show = this.getFromLS('show') || Array(Object.keys(results).length).fill(false);

	 this.setState({ 
    results,
    layout,
    show
  });
};

  toggleShow = (index) => {
    this.setState((prevState) => {
      let newShow = [...prevState.show];
      newShow[index] = !newShow[index];
      return { show: newShow };
    });
  };
 renderData() {
  const { results, layout } = this.state;

  const gridItems = [
    ...this.renderForm(),
    ...Object.entries(results).map(([key, value], i) => (
      <div key={i + 10} data-grid={layout[i + 10]} style={{background: 'lightgray', padding: '10px'}}>
        <button onClick={() => this.toggleShow(i)}>
          {this.state.show[i] ? 'Hide' : 'Show'} {key}
        </button>
        {this.state.show[i] && <p style={{overflowWrap: 'break-word'}}>{JSON.stringify(value, null, 2)}</p>}
      </div>
    ))
  ];

  return (
    <ResponsiveGridLayout
      key={this.state.layoutKey}
      className="layout"
      layouts={{ lg: this.state.layout }}
      breakpoints={{ lg: 1200 }}
      cols={{ lg: 12 }}
      rowHeight={30}
      compactType={null}
      preventCollision={false}
      onLayoutChange={this.onLayoutChange}
    >
      {gridItems}
    </ResponsiveGridLayout>
  );
}

render() {
  return (
    <div className="App" style={{backgroundColor: 'white', color: 'black'}}>
      <header className="App-header">
        <h2 className="my-4">Results</h2>
        {this.renderData()}
      </header>
    </div>
  );
}


renderForm(){
  const formInputs = [
    { label: 'Year', name: 'year', type: 'number' },
    { label: 'Month', name: 'month', type: 'number' },
    { label: 'Day', name: 'day', type: 'number' },
	{ label: 'Birthyear', name: 'byear', type: 'number' },
	{ label: 'Birthmonth', name: 'bmonth', type: 'number' },
	{ label: 'Birthday', name: 'bday', type: 'number' },
	{ label: 'Jaxi', name: 'jaxi', type: 'number' },
	{ label: 'Jahao', name: 'jahao', type: 'number' },
	{ label: 'Firstname', name: 'firstname', type: 'text' },
	{ label: 'Lastname', name: 'lastname', type: 'text' },
    // Add other form inputs here...
  ];
 return [
    ...formInputs.map(({ label, name, type }, i) => (
      <div key={i} data-grid={{i: i.toString(), x: i * 2 % 12, y: Math.floor(i / 6) * 2, w: 6, h: 2}} style={{background: 'lightgray', padding: '10px'}}>
        <label htmlFor={name}>{label}</label>
        <input
          type={type}
          className="form-control"
          name={name}
          value={this.state[name]}
          onChange={this.handleInputChange}
          required
        />
      </div>
    )),
    <div key="button-group" data-grid={{i: 'button-group', x: 0, y: formInputs.length + 1, w: 6, h: 2}} style={{background: 'lightgray', padding: '10px'}}>
      <button type="button" className="btn btn-primary" onClick={this.handleSubmit}>
        Calculate
      </button>
      <button type="button" className="btn btn-secondary" onClick={this.handleSave}>
        <FontAwesomeIcon icon={faSave} /> Save Layout
      </button>
      <button type="button" className="btn btn-secondary" onClick={this.handleLoad}>
        <FontAwesomeIcon icon={faDownload} /> Load Layout
      </button>
      <button type="button" className="btn btn-secondary" onClick={this.handleExport}>
        <FontAwesomeIcon icon={faFileExport} /> Export Layout
      </button>
      <input type="file" id="importInput" style={{ display: 'none' }} onChange={this.handleImport} />
      <button type="button" className="btn btn-secondary" onClick={() => document.getElementById('importInput').click()}>
        <FontAwesomeIcon icon={faFileImport} /> Import Layout
      </button>
    </div>
  ];

}
}
export default App;