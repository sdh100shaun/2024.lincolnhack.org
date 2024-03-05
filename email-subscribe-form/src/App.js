import React, { useState } from "react";
import ReactDOM from "react-dom";

const useForm = (initState, callback) => {
  const [values, setValues] = useState(initState);
  const handleChange = e => setValues({ ...values, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    callback();
  };
  return { values, handleChange, handleSubmit };
};

const useFetch = (url, options) => {
  const [status, setStatus] = React.useState({});

  const fetchApi = async () => {
    try {
      const response = await fetch(url, options);
      setStatus({ ok: response.ok });
    } catch (error) {
      console.error('An error occurred:', error);
      setStatus({ ok: false });
    }
  };

  return [status, fetchApi];
};

const EmailInput = ({ value, handleChange }) => (
  <input
    type="email"
    placeholder="Enter your email"
    name="email"
    value={value}
    onChange={handleChange}
  />
);

const SubmitButton = () => <button className="btn" type="submit">Subscribe</button>;

const Message = ({ children }) => <p className="message">{children}</p>;

function SubscribeForm({ setMessage }) {
  const { values, handleChange, handleSubmit } = useForm({ email: '' }, submitForm);

  const [status, fetchData] = useFetch('https://api.2024.lincolnhack.org/contact/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({email: values.email, created: new Date()}),
    mode: 'cors'
  });

  async function submitForm() {
    await fetchData();
    if (!status.ok) console.error('Failed to post data to the API.');
    setMessage(values.email ? 'Data sent to the subscription API successfully.' : 'Please enter your email.');
  }

  return (
    <form onSubmit={handleSubmit}>
      <EmailInput value={values.email} handleChange={handleChange} />
      <SubmitButton />
      <Message>{message}</Message>
    </form>
  );
}

const App = () => {
  const [message, setMessage] = useState('');
  return (
    <div className="form-target">
      <SubscribeForm setMessage={setMessage} />
      <Message>{message}</Message>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
