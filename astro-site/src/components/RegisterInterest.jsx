import React from "react";
import ReactDOM from "react-dom/client";

function SubscribeForm() {
  const [email, setEmail ] = React.useState('');
  const [message, SetMessage ] = React.useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('https://api.2024.lincolnhack.org/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        mode: 'cors',
      });
  
      if (response.ok) {
        // Data was successfully posted to the API.
        if(email === ''){
          SetMessage('Please enter your email.');
        } else {
          SetMessage('Data sent to the subscription API successfully.');
        }
      } else {
        console.error('Failed to post data to the API.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };
  
  return (
      <form onSubmit={handleSubmit}>
        <input
          className="px-4 py-2 rounded-l"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
        />
        <button  className="button-dark-purple hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-r" type="submit">Register Your Interest</button>
        <p className="message text-blue-800 text-sm md:text-base lg:text-lg px-4 py-2">{message}</p>
      </form>
  );
}

export default function RegisterInterest() {
  return (
    <section className="bg-gray-200 py-8" id="register">
    <div className="container mx-auto text-center">
        <h2 className="uppercase text-3xl font-bold mb-4 text-pretty">Interested in LincolnHack?</h2>
        <p className="mb-6">Sign up now to stay updated and be the first to know when registration opens!</p>
        <SubscribeForm />
    </div>
</section>
  );
}
