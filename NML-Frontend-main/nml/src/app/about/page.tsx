'use client';

import { useState } from 'react';

export default function AboutPage() {
  const [number, setNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomNumber = async () => {
  try {
    setError(null);     // Clear previous errors
    setNumber(null);    // Clear previous number

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/random-number`);
    if (!response.ok) throw new Error('Server responded with an error');

    const data = await response.json();
    setNumber(data.random_number);
  } catch (err) {
    console.error(err);
    setError('Failed to fetch random number');
  }
};


  return (
    <div>
      <h1>Welcome to our New Media Lab Project!</h1>
      <h2>We call it ShortReads.</h2>
      <p>
        On the "Home" screen, you can click the <strong>Get recommendations</strong> button to go to a questionnaire to indicate your interest.
      </p>
      <p>
        Once you indicate your interest, we will recommend stories to you. If a story interests you, you can click the <strong>Read more</strong> button to show more information.
      </p>
      <p>
        If you want to read the story after viewing more information, click the <strong>Read now</strong> button.
      </p>
      <p>
        After you are done reading a story, you can click <strong>Done</strong> and go back to the home page to view more stories!
      </p>
      <p>Enjoy!</p>
      <button onClick={fetchRandomNumber}>Get Random Number</button>

      {/* Display only one of the following */}
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : number !== null ? (
        <p>Random Number: {number}</p>
      ) : null}
    </div>
  );
}
