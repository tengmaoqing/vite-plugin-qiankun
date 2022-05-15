import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
       <button type="button" onClick={() => setCount((count) => count + 1)}>
        react18 count is: {count}
      </button>
    </div>
  )
}

export default App
