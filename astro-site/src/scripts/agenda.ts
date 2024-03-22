// Purpose: Agenda functionality for the site
const agenda = () => {
    const agendaItems = document.querySelectorAll('.event__time');

    if (agendaItems.length > 0) {
        agendaItems.forEach((item) => {
            let date_future =  parseInt(item.dataset.starttime);
            let date_now = new Date().valueOf();
     
    
          var delta = Math.abs(date_future - date_now) / 1000;

            // calculate (and subtract) whole days
            var days = Math.floor(delta / 86400);
            delta -= days * 86400;

            // calculate (and subtract) whole hours
            var hours = Math.floor(delta / 3600) % 24;
            delta -= hours * 3600;

            // calculate (and subtract) whole minutes
            var minutes = Math.floor(delta / 60) % 60;
            delta -= minutes * 60;

            // what's left is seconds
            var seconds = delta % 60; 
            
            console.log(days, hours, minutes, seconds);

            if (seconds < 0 && hours < 0 && minutes < 0) {
                item.classList.add('agenda__item--past');
                item.innerHTML = 'been and gone';
            }
            else if (seconds < 0 && hours < 0 && minutes < 0) {
                item.classList.add('agenda__item--current');
                item.innerHTML = ' &#128640; happening now';
            }
            else {
                item.classList.add('agenda__item--future');
                
                item.innerHTML = 'starting in hours';
            }
        })
    }
};
agenda();
const interval = setInterval(agenda, 1000,1);