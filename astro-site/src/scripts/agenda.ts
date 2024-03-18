// Purpose: Agenda functionality for the site
const agenda = () => {
    const agendaItems = document.querySelectorAll('.event__time');
    let currentTimestamp = new Date().getTime();
    if (agendaItems.length > 0) {
        agendaItems.forEach((item) => {
        
            const difference = new Date(parseInt(item.dataset.starttime)).getTime() - currentTimestamp;
            var secondsDifference = Math.floor(difference/1000);
            console.log(secondsDifference);
            if (secondsDifference > 0 && secondsDifference < 3600) {
                item.classList.add('agenda__item--past');
                item.innerHTML = 'been and gone';
            }
            else if (secondsDifference > 0 && secondsDifference < 3600) {
                item.classList.add('agenda__item--current');
                item.innerHTML = ' &#128640; happening now';
            }
            else {
                item.classList.add('agenda__item--future');
                item.innerHTML = 'starting in ' + Math.floor(secondsDifference/3600) + ' hours';
            }
        })
    }
};
agenda();
const interval = setInterval(agenda, 1000,1);