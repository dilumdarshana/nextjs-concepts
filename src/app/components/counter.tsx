import { useState } from 'react';

const Counter = () => {
  const [counter, setCounter] = useState(0);
  console.log('Counter Component');
  return (
    <>
      <div>Counter {counter}</div>
      <button onClick={() => setCounter(counter + 1)}>Click Me</button>
    </>
  )
}

export default Counter;
