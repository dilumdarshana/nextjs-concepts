'use client';
import { useRouter } from 'next/navigation';

const About = () => {
  const router = useRouter();

  return (
    <>
      <h2>About</h2>
      <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => router.push('/')}>Go Home</button>
    </>
  );
};

export default About;
