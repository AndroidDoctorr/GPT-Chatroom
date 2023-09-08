import { useState } from 'react'
import './App.css'
import Conversation from './components/Conversation'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Conversation />
    </>
  )
}

export default App
