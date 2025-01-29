import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

const Counter = () => {
  const [counter, setCounter] = useState(0);
  // console.log('Counter Client Component');

  // clerk auth info
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  if (!isLoaded || !userId) return <div className="text-red-500">Counter Component Unauthorised</div>;

  // clerk user info
  const { isSignedIn, user } = useUser();
  if (!isSignedIn) return <div className="text-red-500">Counter Component Unauthorised</div>;

  return (
    <>
      <div>Counter {counter}</div>
      <button className="bg-blue-500 rounded w-20 content-center" onClick={() => setCounter(counter + 1)}>Click Me</button>
    </>
  )
}

export default Counter;
