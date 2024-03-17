// Purpose: Agenda functionality for the site
let currentTimestamp = new Date().getTime();

const agenda = () => {
    const agendaItems = document.querySelectorAll('.event__time');
    
    if (agendaItems.length > 0) {
        agendaItems.forEach((item) => {
        console.log(item.dataset.starttime);
        const itemTimestamp = parseInt(item.dataset.starttime);
        
        if (itemTimestamp > currentTimestamp) {
            item.classList.add('agenda__item--past');
            console.log('past');
        }
        });
    }
};

const interval = setInterval(agenda, 1000);