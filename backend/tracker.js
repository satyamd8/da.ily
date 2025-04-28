// tracker.js


// Stopwatch functionality
let stopwatchTimer;
let stopwatchRunning = false;
let stopwatchSeconds = 0;
let activeTaskItem = null;
const taskTimeData = {
  class: 0,  // Initialize time tracking for classes
  club: 0    // Initialize time tracking for clubs
};

// Task count tracking for bar chart
const taskCountData = {
  weekly: {
    class: [0, 0, 0, 0, 0, 0, 0],   // Mon-Sun for classes
    club: [0, 0, 0, 0, 0, 0, 0]     // Mon-Sun for clubs
  },
  monthly: {
    class: [0, 0, 0, 0],  // Week 1-4 for classes
    club: [0, 0, 0, 0]    // Week 1-4 for clubs
  }
};

const stopwatchDisplay = document.getElementById('stopwatch-display');
const stopwatchStartBtn = document.getElementById('stopwatch-start');
const stopwatchStopBtn = document.getElementById('stopwatch-stop');
const stopwatchResetBtn = document.getElementById('stopwatch-reset');

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function updateStopwatch() {
  stopwatchDisplay.textContent = formatTime(stopwatchSeconds);
}

function startStopwatch() {
  if (!activeTaskItem) {
    alert('Please select a task first by clicking on it');
    return;
  }
  
  if (!stopwatchRunning) {
    stopwatchRunning = true;
    stopwatchTimer = setInterval(() => {
      stopwatchSeconds++;
      updateStopwatch();
    }, 1000);
    stopwatchStartBtn.textContent = 'Pause';
  } else {
    clearInterval(stopwatchTimer);
    stopwatchRunning = false;
    stopwatchStartBtn.textContent = 'Resume';
  }
}

function stopStopwatch() {
  
  if (stopwatchRunning) {
    clearInterval(stopwatchTimer);
    stopwatchRunning = false;
    stopwatchStartBtn.textContent = 'Start';
  }
  
  // Record time for the active task
  if (activeTaskItem && stopwatchSeconds > 0) {
    const taskType = activeTaskItem.dataset.type; // 'class' or 'club'
    
    // Add time to the appropriate category
    taskTimeData[taskType] += stopwatchSeconds;
    
    // Display time on the task item
    const timeDisplayed = formatTimeForDisplay(stopwatchSeconds);
    
    // Find or create the time element in the task item
    let timeElement = activeTaskItem.querySelector('.time-spent');
    if (timeElement) {
      // If there's already a time element, update it
      timeElement.textContent = timeDisplayed;
    } else {
      // Create a new time element
      timeElement = document.createElement('span');
      timeElement.classList.add('time-spent');
      timeElement.textContent = timeDisplayed;
      activeTaskItem.appendChild(timeElement);
    }
    
    // Update the cumulative time data attribute
    let totalTaskSeconds = parseInt(activeTaskItem.dataset.totalSeconds || '0');
    totalTaskSeconds += stopwatchSeconds;
    activeTaskItem.dataset.totalSeconds = totalTaskSeconds;
    
    // Update the pie chart
    updatePieChart();
  }
}

function formatTimeForDisplay(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return ` - ${hours}h ${minutes}m`;
  } else {
    return ` - ${minutes}m`;
  }
}

function resetStopwatch() {
  clearInterval(stopwatchTimer);
  stopwatchRunning = false;
  stopwatchSeconds = 0;
  updateStopwatch();
  stopwatchStartBtn.textContent = 'Start';
}

stopwatchStartBtn.addEventListener('click', startStopwatch);
stopwatchStopBtn.addEventListener('click', stopStopwatch);
stopwatchResetBtn.addEventListener('click', resetStopwatch);

// Task Management
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const finishedTaskList = document.getElementById('finished-task-list');

// Track current view
let currentView = 'weekly';

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('task-name').value.trim();
  const type = document.getElementById('task-type').value;
  const category = document.getElementById('task-category').value.trim();

  if (name && category) {
    const li = document.createElement('li');
    li.textContent = `${name} (${type}: ${category})`;
    li.dataset.name = name;
    li.dataset.type = type;
    li.dataset.category = category;
    li.dataset.totalSeconds = '0';
    
    // Add click event to select task for stopwatch
    li.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent double-click from firing immediately
      
      // If stopwatch is running, ask to stop first
      if (stopwatchRunning && activeTaskItem !== this) {
        if (confirm('Stop current timer before switching tasks?')) {
          stopStopwatch();
        } else {
          return;
        }
      }
      
      // Clear previous active task
      if (activeTaskItem) {
        activeTaskItem.classList.remove('active-task');
      }
      
      // Set new active task
      activeTaskItem = this;
      this.classList.add('active-task');
      
      // Reset stopwatch for new task
      resetStopwatch();
    });
    
    // Add double-click event to move task to finished list and update chart
    li.addEventListener('dblclick', function(e) {
      // Make sure stopwatch is stopped
      if (stopwatchRunning && activeTaskItem === this) {
        stopStopwatch();
      }
      
      finishedTaskList.appendChild(this);
      
      // Get task type ('class' or 'club')
      const taskType = this.dataset.type;
      
      // Update both data sets
      const today = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      
      // Chart labels are [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
      // So adjust Sunday (0) to be at index 6
      const dayIndex = today === 0 ? 6 : today - 1;
      
      // Update weekly data for this task type
      taskCountData.weekly[taskType][dayIndex]++;
      
      // Update monthly data for this task type
      const date = new Date();
      const dayOfMonth = date.getDate();
      const weekOfMonth = Math.ceil(dayOfMonth / 7) - 1; // 0-indexed
      taskCountData.monthly[taskType][weekOfMonth < 4 ? weekOfMonth : 3]++; // Cap at week 4
      
      // Update the currently visible chart view
      updateBarChart();
      
      // Remove active task reference if this was the active task
      if (activeTaskItem === this) {
        activeTaskItem = null;
      }
      
      // Remove the click handler to prevent timing completed tasks
      this.removeEventListener('click', arguments.callee);
    });
    
    taskList.appendChild(li);
    taskForm.reset();
  }
});

// Set up the stacked bar chart
const barCtx = document.getElementById('progress-chart').getContext('2d');
let barChart = new Chart(barCtx, {
  type: 'bar',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Classes',
        data: taskCountData.weekly.class,
        backgroundColor: '#826189' // Purple for classes
      },
      {
        label: 'Clubs',
        data: taskCountData.weekly.club,
        backgroundColor: '#ff82b6' // Pink for clubs
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1 // Only show whole numbers
        }
      }
    }
  }
});

// Function to update the bar chart based on current view
function updateBarChart() {
  if (currentView === 'weekly') {
    barChart.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    barChart.data.datasets[0].data = taskCountData.weekly.class;
    barChart.data.datasets[1].data = taskCountData.weekly.club;
  } else {
    barChart.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    barChart.data.datasets[0].data = taskCountData.monthly.class;
    barChart.data.datasets[1].data = taskCountData.monthly.club;
  }
  barChart.update();
}

// Time Pie Chart for Classes vs Clubs
const pieCtx = document.getElementById('time-chart').getContext('2d');
let pieChart = new Chart(pieCtx, {
  type: 'pie',
  data: {
    labels: ['Classes', 'Clubs'],
    datasets: [{
      data: [0, 0], // Initial data
      backgroundColor: [
        '#826189', // Purple for classes
        '#ff82b6'  // Pink for clubs
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const seconds = context.raw;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${context.label}: ${hours}h ${minutes}m`;
          }
        }
      }
    }
  }
});

// Function to update the pie chart
function updatePieChart() {
  pieChart.data.datasets[0].data = [taskTimeData.class, taskTimeData.club];
  pieChart.update();
}

// View Toggle (Weekly/Monthly)
const weeklyBtn = document.getElementById('weekly-btn');
const monthlyBtn = document.getElementById('monthly-btn');

weeklyBtn.addEventListener('click', () => {
  weeklyBtn.classList.add('active');
  monthlyBtn.classList.remove('active');
  currentView = 'weekly';
  updateBarChart();
});

monthlyBtn.addEventListener('click', () => {
  weeklyBtn.classList.remove('active');
  monthlyBtn.classList.add('active');
  currentView = 'monthly';
  updateBarChart();
});