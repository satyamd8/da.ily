//session notifications
document.addEventListener('DOMContentLoaded', function() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
});

function scheduleSessionNotification(event) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const now = new Date();
        const delay = eventDateTime - now;

        if (delay > 0) {
            setTimeout(() => {
                new Notification('Session Starting!', {
                    body: `Your session "${event.subject}" is starting now.`,
                    icon: '/img/icon.svg'
                });
            }, delay);
        }
    }
}



const month_year = document.getElementById('month');
const days = document.getElementById('days');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const addSesh = document.getElementById('add-session');
const sessions = document.getElementById('sessions');
const overlays = document.getElementById('overlay');
const form = document.querySelector('form');
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
const cancelBtn = document.getElementById('cancel-btn');

//getting currentDate
let currentDate = new Date();

//create calendar with months and days
function createCalendar()
{
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth+1, 0);
    const totalDays = lastDay.getDate();
    const first_index = firstDay.getDay();
    const last_index = lastDay.getDay();

    //creating the header with the month and year
    const month_year_str = currentDate.toLocaleString('default', {month: 'long', year: 'numeric'});
    month_year.textContent = month_year_str;

    let generateDays = '';

    //previous month's days
    for(let i = first_index; i > 0; --i)
    {
        const prevDate = new Date(currentYear, currentMonth, 0 - i+1);
        generateDays += `<div class="days-inactive">${prevDate.getDate()}</div>`;
    }

    //current month's days
    for(let i = 1; i <= totalDays; ++i) {
        const date = new Date(currentYear, currentMonth, i);
        const formattedDate = date.toISOString().split("T")[0]; // Format: yyyy-mm-dd
        const activeDate = date.toDateString() === new Date().toDateString() ? 'active' : '';

        const dayEvents = events
        .map((event, index) => ({ ...event, index }))
        .filter(event => event.date === formattedDate);

        let eventHTML = '';
        dayEvents.forEach(event => {
            eventHTML += `<div class="event-tag" data-index="${event.index}">${event.subject}</div>`;
        });
    
        generateDays += `
            <div class="date ${activeDate}" data-date="${formattedDate}">
                <div>${i}</div>
                ${eventHTML}
            </div>
        `;
    }
    
    //next month's days
    for(let i = 1; i<= 7 - last_index; ++i)
    {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        generateDays += `<div class="date-inactive">${nextDate.getDate()}</div>`;
    }

    days.innerHTML = generateDays;

    document.querySelectorAll('.event-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const index = tag.getAttribute('data-index');
            const event = events[index];
    
            // Fill in the modal with the event data
            document.getElementById('session-subject').textContent = event.subject;
            document.getElementById('session-date').textContent = event.date;
            document.getElementById('session-time').textContent = event.time;
            document.getElementById('session-notes').textContent = event.notes;
    
            cancelBtn.setAttribute('data-index', index);
            document.getElementById('newSession').style.display = 'block';
            document.getElementById('overlay').style.display = 'block';
        });
    });
    
}

prevBtn.addEventListener("click",() => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    createCalendar();
})

nextBtn.addEventListener("click",() => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    createCalendar();
})

addSesh.addEventListener("click",() => {
    sessions.style.display = "flex";
    overlays.style.display = "block";
})

overlays.addEventListener("click",() => {
    sessions.style.display = "none";
    overlays.style.display = "none";
})

overlays.addEventListener("click", () => {
    document.getElementById('newSession').style.display = 'none'; // Hide modal
});

createCalendar();

//event creation
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const subject = document.getElementById('subject').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const notes = document.getElementById('notes').value;

    const newEvent = {
        subject,
        date,
        time,
        notes
    };

    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));

    scheduleSessionNotification(newEvent);

    form.reset();
    sessions.style.display = "none";
    overlays.style.display = "none";

    createCalendar(); // Refresh the calendar so the event shows up
});

cancelBtn.addEventListener('click', () => {
    const index = cancelBtn.getAttribute('data-index');

    if (confirm('Delete this event?')) {
        events.splice(index, 1);
        localStorage.setItem('events', JSON.stringify(events));
        document.getElementById('newSession').style.display = 'none';
        createCalendar(); // Refresh
    }
});