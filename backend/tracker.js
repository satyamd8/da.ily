// Enhanced tracker.js with persistent stopwatch

// Use localStorage to track stopwatch state across page loads
let stopwatchRunning = false;
let activeTaskItem = null;
const taskTimeData = {
  class: parseInt(localStorage.getItem('taskTimeData_class') || '0'),
  club: parseInt(localStorage.getItem('taskTimeData_club') || '0')
};

// Task count tracking for bar chart
const taskCountData = {
  weekly: {
    class: JSON.parse(localStorage.getItem('taskCountData_weekly_class') || '[0, 0, 0, 0, 0, 0, 0]'),
    club: JSON.parse(localStorage.getItem('taskCountData_weekly_club') || '[0, 0, 0, 0, 0, 0, 0]')
  },
  monthly: {
    class: JSON.parse(localStorage.getItem('taskCountData_monthly_class') || '[0, 0, 0, 0]'),
    club: JSON.parse(localStorage.getItem('taskCountData_monthly_club') || '[0, 0, 0, 0]')
  }
};

// Stopwatch with timestamp-based tracking instead of interval counting
const stopwatchDisplay = document.getElementById('stopwatch-display');
const stopwatchStartBtn = document.getElementById('stopwatch-start');
const stopwatchStopBtn = document.getElementById('stopwatch-stop');
const stopwatchResetBtn = document.getElementById('stopwatch-reset');

// Init stopwatch from localStorage
let stopwatchSeconds = parseInt(localStorage.getItem('stopwatch_seconds') || '0');
let stopwatchStartTime = localStorage.getItem('stopwatch_startTime') ? 
                          parseInt(localStorage.getItem('stopwatch_startTime')) : null;
let activeTaskId = localStorage.getItem('active_task_id');

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function updateStopwatch() {
  if (stopwatchRunning && stopwatchStartTime) {
    // Calculate elapsed time based on the difference between now and start time
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - stopwatchStartTime) / 1000);
    stopwatchSeconds = parseInt(localStorage.getItem('stopwatch_base_seconds') || '0') + elapsedSeconds;
  }
  stopwatchDisplay.textContent = formatTime(stopwatchSeconds);
  
  // Update localStorage
  localStorage.setItem('stopwatch_seconds', stopwatchSeconds.toString());
  
  // If running, request next animation frame for smooth updates
  if (stopwatchRunning) {
    requestAnimationFrame(updateStopwatch);
  }
}

function startStopwatch() {
  if (!activeTaskItem) {
    // Try to recover active task from localStorage
    if (activeTaskId) {
      const allTasks = document.querySelectorAll('#task-list li');
      for (let task of allTasks) {
        if (task.id === activeTaskId) {
          activeTaskItem = task;
          activeTaskItem.classList.add('active-task');
          break;
        }
      }
    }
    
    if (!activeTaskItem) {
      alert('Please select a task first by clicking on it');
      return;
    }
  }
  
  if (!stopwatchRunning) {
    stopwatchRunning = true;
    
    // Set the start time to now
    stopwatchStartTime = Date.now();
    
    // Store current seconds as base for calculations
    localStorage.setItem('stopwatch_base_seconds', stopwatchSeconds.toString());
    localStorage.setItem('stopwatch_startTime', stopwatchStartTime.toString());
    localStorage.setItem('stopwatch_running', 'true');
    
    // Start animation frame loop for smooth updates
    requestAnimationFrame(updateStopwatch);
    
    stopwatchStartBtn.textContent = 'Pause';
  } else {
    // Pause the stopwatch
    stopwatchRunning = false;
    localStorage.setItem('stopwatch_running', 'false');
    
    // Update the base seconds to include elapsed time
    localStorage.setItem('stopwatch_base_seconds', stopwatchSeconds.toString());
    localStorage.setItem('stopwatch_startTime', '');
    
    stopwatchStartBtn.textContent = 'Resume';
  }
}

function stopStopwatch() {
  if (stopwatchRunning) {
    stopwatchRunning = false;
    localStorage.setItem('stopwatch_running', 'false');
    
    // Final update to stopwatch seconds
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - stopwatchStartTime) / 1000);
    stopwatchSeconds = parseInt(localStorage.getItem('stopwatch_base_seconds') || '0') + elapsedSeconds;
    
    localStorage.setItem('stopwatch_seconds', stopwatchSeconds.toString());
    localStorage.setItem('stopwatch_startTime', '');
    
    stopwatchStartBtn.textContent = 'Start';
  }
  
  // Record time for the active task
  if (activeTaskItem && stopwatchSeconds > 0) {
    const taskType = activeTaskItem.dataset.type; // 'class' or 'club'
    
    // Add time to the appropriate category
    taskTimeData[taskType] += stopwatchSeconds;
    localStorage.setItem(`taskTimeData_${taskType}`, taskTimeData[taskType].toString());
    
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
    
    // Save task data
    saveTasksToLocalStorage();
    
    // Update the pie chart
    updatePieChart();
  }
  
  // Clear active task reference
  localStorage.removeItem('active_task_id');
}

function formatTimeForDisplay(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return ` (${hours}h ${minutes}m ${remainingSeconds}s)`;
  } else if (minutes > 0) {
    return ` (${minutes}m ${remainingSeconds}s)`;
  } else {
    return ` (${remainingSeconds}s)`;
  }
}

function resetStopwatch() {
  stopwatchRunning = false;
  stopwatchSeconds = 0;
  localStorage.setItem('stopwatch_running', 'false');
  localStorage.setItem('stopwatch_seconds', '0');
  localStorage.setItem('stopwatch_base_seconds', '0');
  localStorage.setItem('stopwatch_startTime', '');
  
  updateStopwatch();
  stopwatchStartBtn.textContent = 'Start';
}

// Save all tasks to localStorage
function saveTasksToLocalStorage() {
  const tasks = [];
  document.querySelectorAll('#task-list li').forEach(taskEl => {
    tasks.push({
      id: taskEl.id,
      name: taskEl.dataset.name,
      type: taskEl.dataset.type,
      category: taskEl.dataset.category,
      totalSeconds: parseInt(taskEl.dataset.totalSeconds || '0')
    });
  });
  
  localStorage.setItem('tasks', JSON.stringify(tasks));
  
  // Save completed tasks
  const completedTasks = [];
  document.querySelectorAll('#finished-task-list li').forEach(taskEl => {
    completedTasks.push({
      id: taskEl.id,
      name: taskEl.dataset.name,
      type: taskEl.dataset.type,
      category: taskEl.dataset.category,
      totalSeconds: parseInt(taskEl.dataset.totalSeconds || '0')
    });
  });
  
  localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
}

// Load tasks from localStorage
function loadTasksFromLocalStorage() {
  // Load active tasks
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  tasks.forEach(task => {
    const li = createTaskElement(task);
    taskList.appendChild(li);
  });
  
  // Load completed tasks
  const completedTasks = JSON.parse(localStorage.getItem('completed_tasks') || '[]');
  completedTasks.forEach(task => {
    const li = createTaskElement(task);
    // Remove click handler for completed tasks
    li.removeEventListener('click', handleTaskClick);
    finishedTaskList.appendChild(li);
  });
  
  // Check if there's an active task
  if (activeTaskId) {
    const allTasks = document.querySelectorAll('#task-list li');
    for (let task of allTasks) {
      if (task.id === activeTaskId) {
        activeTaskItem = task;
        activeTaskItem.classList.add('active-task');
        break;
      }
    }
  }
}

// Function to create a task element from task data
function createTaskElement(task) {
  const li = document.createElement('li');
  li.id = task.id || 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  li.textContent = `${task.name} (${task.type}: ${task.category})`;
  li.dataset.name = task.name;
  li.dataset.type = task.type;
  li.dataset.category = task.category;
  li.dataset.totalSeconds = task.totalSeconds || '0';
  
  // Add time display if time has been tracked
  if (task.totalSeconds > 0) {
    const timeElement = document.createElement('span');
    timeElement.classList.add('time-spent');
    timeElement.textContent = formatTimeForDisplay(task.totalSeconds);
    li.appendChild(timeElement);
  }
  
  // Add click event to select task for stopwatch
  li.addEventListener('click', handleTaskClick);
  
  // Add double-click event to move task to finished list
  li.addEventListener('dblclick', handleTaskComplete);
  
  return li;
}

function handleTaskClick(e) {
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
  
  // Store active task ID in localStorage
  localStorage.setItem('active_task_id', this.id);
  
  // Reset stopwatch for new task
  resetStopwatch();
}

function handleTaskComplete(e) {
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
  localStorage.setItem(`taskCountData_weekly_${taskType}`, JSON.stringify(taskCountData.weekly[taskType]));
  
  // Update monthly data for this task type
  const date = new Date();
  const dayOfMonth = date.getDate();
  const weekOfMonth = Math.ceil(dayOfMonth / 7) - 1; // 0-indexed
  const weekIndex = weekOfMonth < 4 ? weekOfMonth : 3; // Cap at week 4
  taskCountData.monthly[taskType][weekIndex]++;
  localStorage.setItem(`taskCountData_monthly_${taskType}`, JSON.stringify(taskCountData.monthly[taskType]));
  
  // Update the currently visible chart view
  updateBarChart();
  
  // Remove active task reference if this was the active task
  if (activeTaskItem === this) {
    activeTaskItem = null;
    localStorage.removeItem('active_task_id');
  }
  
  // Remove the click handler to prevent timing completed tasks
  this.removeEventListener('click', handleTaskClick);
  
  // Save updated task lists
  saveTasksToLocalStorage();
}

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
  loadTasksFromLocalStorage();
  
  // Check if stopwatch was running when page was closed
  if (localStorage.getItem('stopwatch_running') === 'true') {
    stopwatchRunning = true;
    stopwatchStartBtn.textContent = 'Pause';
    
    // Resume the stopwatch
    if (stopwatchStartTime) {
      requestAnimationFrame(updateStopwatch);
    } else {
      // If startTime was lost, set it to now and continue
      stopwatchStartTime = Date.now();
      localStorage.setItem('stopwatch_startTime', stopwatchStartTime.toString());
      requestAnimationFrame(updateStopwatch);
    }
  } else {
    // Just update display with saved time
    updateStopwatch();
  }
  
  // Initialize the charts
  updateBarChart();
  updatePieChart();
});

// Add event listeners
stopwatchStartBtn.addEventListener('click', startStopwatch);
stopwatchStopBtn.addEventListener('click', stopStopwatch);
stopwatchResetBtn.addEventListener('click', resetStopwatch);

// Task Management
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const finishedTaskList = document.getElementById('finished-task-list');

// Track current view
let currentView = localStorage.getItem('current_view') || 'weekly';
const weeklyBtn = document.getElementById('weekly-btn');
const monthlyBtn = document.getElementById('monthly-btn');

// Set the initial view state
if (currentView === 'weekly') {
  weeklyBtn.classList.add('active');
  monthlyBtn.classList.remove('active');
} else {
  weeklyBtn.classList.remove('active');
  monthlyBtn.classList.add('active');
}

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('task-name').value.trim();
  const type = document.getElementById('task-type').value;
  const category = document.getElementById('task-category').value.trim();

  if (name && category) {
    const task = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: name,
      type: type,
      category: category,
      totalSeconds: 0
    };
    
    const li = createTaskElement(task);
    taskList.appendChild(li);
    taskForm.reset();
    
    // Save tasks to localStorage
    saveTasksToLocalStorage();
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
      data: [taskTimeData.class, taskTimeData.club], // Load from localStorage
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
weeklyBtn.addEventListener('click', () => {
  weeklyBtn.classList.add('active');
  monthlyBtn.classList.remove('active');
  currentView = 'weekly';
  localStorage.setItem('current_view', currentView);
  updateBarChart();
});

monthlyBtn.addEventListener('click', () => {
  weeklyBtn.classList.remove('active');
  monthlyBtn.classList.add('active');
  currentView = 'monthly';
  localStorage.setItem('current_view', currentView);
  updateBarChart();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Page is now visible, check if stopwatch should be running
    if (localStorage.getItem('stopwatch_running') === 'true') {
      stopwatchRunning = true;
      stopwatchStartTime = parseInt(localStorage.getItem('stopwatch_startTime'));
      requestAnimationFrame(updateStopwatch);
    }
  }
});

// Periodically save state even when running (as backup)
setInterval(() => {
  if (stopwatchRunning) {
    // Update stored seconds
    localStorage.setItem('stopwatch_seconds', stopwatchSeconds.toString());
  }
}, 10000); // Every 10 seconds