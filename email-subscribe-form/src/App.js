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
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
        />
        <button  className="btn" type="submit">Subscribe</button>
        <p className="message" >{message}</p>
      </form>
  );
}

const App = () => {
  return (
    <div className="form-target">
        <SubscribeForm />
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(<App />);

