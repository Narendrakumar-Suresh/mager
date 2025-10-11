'use client';
import { useState } from 'react'
export default function About() {
  const [count, setCount] = useState(0)
  return (
  <div>
    <p>Count: {count}</p>
    <button onClick={() => setCount(count + 1)}>Click me</button>
    <h1>About</h1>
  </div>
  )
}