const month_year = document.getElementById('month');
const days = document.getElementById('days');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let currentDate = new Date();

function createCalendar()
{
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDay = new Date(currentYear, currentMonth, 0);
    const lastDay = new Date(currentYear, currentMonth+1, 0);
    const totalDays = lastDay.getDate();
    const first_index = firstDay.getDate();
    const last_index = lastDay.getDate();

    const month_year_str = currentDate.toLocaleString('default', {month: 'long', year: 'numeric'});
    month_year.textContent = month_year_str;

    let generateDays = '';

    for(let i = first_index; i > 0; --i)
    {
        const prevDate = new Date(currentYear, currentMonth, 0 - i+1);
        generateDays += `<div class="days-inactive">${prevDate.getDate()}</div>`;
    }

    for(let i = 1; i <= totalDays; ++i)
    {
        const date = new Date(currentYear, currentMonth, i);
        const activeDate = date.toDateString() === new Date().toDateString() ? 'active' : '';
        generateDays += `<div class="date ${activeDate}"> ${i} </div>`;
    }

    for(let i = 1; i<= 7 - last_index; ++i)
    {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        generateDays += `<div class="date inactive">${nextDate.getDate()}</div>`;
    }

    days.innerHTML = generateDays;
}

prevBtn.addEventListener("click",() => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    createCalendar();
})

nextBtn.addEventListener("click",() => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    createCalendar();
})

createCalendar();