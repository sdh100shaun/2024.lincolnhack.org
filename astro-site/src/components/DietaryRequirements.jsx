import React, { useState } from "react";

function DietaryForm() {
  const [email, setEmail ] = useState('');
  const [dietaryRequirements, setDietary ] = useState('');
  const [message, SetMessage] = useState('');
  const [ticketRef, setTicketRef] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleTicketRefChange = (e) => {
    setTicketRef(e.target.value);
  };

  const handleDietaryChange = (e) => {
    var options = e.target.options;
    var value = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setDietary(value.join(', '));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.target.disabled = true;
    try {
      const response = await fetch('https://api.2024.lincolnhack.org/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, dietaryRequirements, ticketRef, created: Math.floor(Date.now() / 1000).toString()}),
        mode: 'cors',
      });
  
      if (response.ok) {
        // Data was successfully posted to the API.
        if(email === ''){
          SetMessage('Please enter your email.');
        } else {
          SetMessage('Thanks for dietary requirements. We will be in touch.');
          e.target.disabled = true;
          setEmail('');
          setDietary('');
          setTicketRef('');
          console.log('Data posted successfully.');
          window.alert('Thanks for dietary requirements. We will be in touch if necessary.');
          window.location.reload();
          return;
        }
      } else {
        console.error('Failed to post data to the API.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const output = ({ messageTxt })=> <p className="text-rose-600 mb-10 font-bold text-pretty">{messageTxt}</p>;
  
  const emailInput = ({ email, handleEmailChange})=>
   <input
    className="w-80 px-4 py-2 m-6 rounded-l block text-gray-900 border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
    type="email"
    placeholder="Enter your email you used to register with."
    value={email}
    name="email"
    id="email"
    required
    onChange={handleEmailChange}
  />;

  const label = (text, field) => <label className="block font-bold text-gray-800 text-left" htmlFor={field}>{text} * </label>;

  const ticketRefInput = ({ ticketRef, handleTicketRefChange})=>
  <input
          className="px-4 py-2 m-6 rounded-l block w-80 text-gray-900 border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          type="text"
          placeholder="Enter your ticket reference"
          value={ticketRef}
          name="ticketRef"
          id="ticketRef"
          required
          onChange={handleTicketRefChange}
        />;

  const dietaryInput = ({ dietaryRequirements, handleDietaryChange})=>
      <select id="dietary" className="m-6 block text-sm font-medium leading-6 text-gray-900" multiple={true} onChange={handleDietaryChange} required >
      <option value="">-- Please choose all Dietary options that apply --</option>
      <option value="none">None</option>
      <option value="Vegan">Vegan</option>
      <option value="Vegetarian">Vegetarian</option>
      <option value="Gluten Free">Gluten Free</option>
      <option value="Allergy">Food Allergy</option>
    </select>;

  const submitBtn = () => <button className="button-dark-purple hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-r" type="submit">Send Details</button>;
  return (
    <div>
        { output({ messageTxt: message }) }
        <p className="mb-10 text-lg md:text-xl"> Before you join us we need to confirm an email for each attendee so we can invite you to slack.
        <i> So if you have got multiple tickets, please make sure you fill out the form for each person attending using the unique ticket reference they have against their name.</i>
        </p>
      <form onSubmit={handleSubmit} method="POST">
        {label('Confirm your email.', 'email')}
        {emailInput({ email, handleEmailChange })}
        {label('Dietary Requirements', 'dietary')}
        {dietaryInput({ dietaryRequirements, handleDietaryChange })}
        {label('Ticket Reference', 'ticketRef')}
        {ticketRefInput({ ticketRef, handleTicketRefChange })}
       
        {submitBtn()}
      </form>
    </div>
  );
}

export default function DietaryRequirments() {
  return (
    <section className="bg-slate-200 py-8 mt-4 px-4" id="dietary">
    <div className="container mx-auto justify-items-stretch">
        <h2 className=" uppercase text-3xl font-bold mb-4 text-pretty text-gray-800">Let us know any dietary requirements</h2>
        <div className="flex">
          <DietaryForm />
        </div>
    </div>
</section>
  );
}
