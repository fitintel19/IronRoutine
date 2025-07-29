import { html } from 'https://esm.sh/htm/preact';
import { useState, useEffect } from 'https://esm.sh/preact/hooks';
import Chart from 'https://esm.sh/chart.js/auto';
import { trackEvent, calculateDuration, formatDate } from '../utils.js';

const TrackProgress = ({ user }) => {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalMinutes: 0, totalCalories: 0, avgDuration: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWorkoutHistory();
      fetchProgressStats();
    }
  }, [user]);

  const fetchWorkoutHistory = async () => {
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        const response = await fetch('/api/workouts/history', {
          headers: { 'Authorization': 'Bearer ' + session.access_token }
        });
        if (response.ok) {
          const data = await response.json();
          setWorkoutHistory(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch workout history:', error);
    }
  };

  const fetchProgressStats = async () => {
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        const response = await fetch('/api/progress/analytics', {
          headers: { 'Authorization': 'Bearer ' + session.access_token }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress stats:', error);
    }
  };

  if (!user) {
    return html`
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold mb-8 text-center">Track Your Progress</h2>
        
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div class="text-center text-gray-400 py-8">
            <div class="text-4xl mb-4">📊</div>
            <p class="mb-6">Sign in to track your fitness progress and see detailed analytics!</p>
          </div>
        </div>
      </div>
    `;
  }

  return html`
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold mb-8 text-center">Track Your Progress</h2>
      
      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 class="text-xl font-semibold mb-4">Progress Overview</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-400">${stats.totalWorkouts}</div>
              <div class="text-sm text-gray-400">Total Workouts</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-400">${stats.totalCalories}</div>
              <div class="text-sm text-gray-400">Calories Burned</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-400">${Math.round(stats.totalMinutes / 60)}</div>
              <div class="text-sm text-gray-400">Hours Trained</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-400">${stats.avgDuration}</div>
              <div class="text-sm text-gray-400">Avg Duration (min)</div>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 class="text-xl font-semibold mb-4">Recent Activity</h3>
          ${workoutHistory.length > 0 ? html`
            <div class="space-y-3">
              ${workoutHistory.slice(0, 5).map(workout => html`
                <div key=${workout.id} class="bg-gray-700/50 rounded-lg p-3">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-medium text-sm">${workout.name}</div>
                      <div class="text-xs text-gray-400">${new Date(workout.completed_at).toLocaleDateString()}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-medium text-purple-400">${workout.duration_minutes}min</div>
                      <div class="text-xs text-gray-400">${workout.calories_burned} cal</div>
                    </div>
                  </div>
                </div>
              `)}
            </div>
          ` : html`
            <div class="text-center text-gray-400 py-8">
              <div class="text-4xl mb-4">📊</div>
              <p>Complete your first workout to see progress here!</p>
            </div>
          `}
        </div>
      </div>

      <!-- Progress Chart -->
      ${workoutHistory.length > 0 ? html`
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
          <h3 class="text-xl font-semibold mb-4">Progress Chart</h3>
          <div class="relative h-64">
            <canvas ref=${(el) => {
              if (el && workoutHistory.length > 0) {
                // Destroy existing chart if it exists
                if (el.chart) {
                  el.chart.destroy();
                }
                
                // Prepare data for the last 7 workouts
                const recentWorkouts = workoutHistory.slice(0, 7).reverse();
                const labels = recentWorkouts.map(w => new Date(w.completed_at).toLocaleDateString());
                const calories = recentWorkouts.map(w => w.calories_burned || 0);
                const duration = recentWorkouts.map(w => w.duration_minutes || 0);
                
                // Create chart
                el.chart = new Chart(el, {
                  type: 'line',
                  data: {
                    labels: labels,
                    datasets: [{
                      label: 'Calories Burned',
                      data: calories,
                      borderColor: 'rgb(168, 85, 247)',
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      yAxisID: 'y'
                    }, {
                      label: 'Duration (min)',
                      data: duration,
                      borderColor: 'rgb(34, 197, 94)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      yAxisID: 'y1'
                    }]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: 'white'
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          color: 'rgb(156, 163, 175)'
                        },
                        grid: {
                          color: 'rgba(156, 163, 175, 0.1)'
                        }
                      },
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                          display: true,
                          text: 'Calories',
                          color: 'rgb(168, 85, 247)'
                        },
                        ticks: {
                          color: 'rgb(156, 163, 175)'
                        },
                        grid: {
                          color: 'rgba(156, 163, 175, 0.1)'
                        }
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                          display: true,
                          text: 'Duration (min)',
                          color: 'rgb(34, 197, 94)'
                        },
                        ticks: {
                          color: 'rgb(156, 163, 175)'
                        },
                        grid: {
                          drawOnChartArea: false,
                        }
                      }
                    }
                  }
                });
              }
            }} class="w-full h-full"></canvas>
          </div>
        </div>
      ` : ''}

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 class="text-xl font-semibold mb-4">Workout History</h3>
        ${workoutHistory.length > 0 ? html`
          <div class="space-y-3">
            ${workoutHistory.map(workout => html`
              <div key=${workout.id} class="bg-gray-700/50 rounded-lg p-4">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-medium text-white">${workout.name}</h4>
                    <p class="text-sm text-gray-400 mt-1">${workout.description || 'No description'}</p>
                    <div class="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>📅 ${new Date(workout.completed_at).toLocaleDateString()}</span>
                      <span>⏱️ ${workout.duration_minutes} minutes</span>
                      <span>🔥 ${workout.calories_burned} calories</span>
                      <span>💪 ${workout.exercises_completed?.length || 0} exercises</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-green-400">
                      ${workout.completion_rate ? Math.round(workout.completion_rate * 100) + '%' : 'Complete'}
                    </div>
                  </div>
                </div>
              </div>
            `)}
          </div>
        ` : html`
          <div class="text-center text-gray-400 py-8">
            <div class="text-4xl mb-4">🏋️</div>
            <p>Your workout history will appear here after completing workouts!</p>
          </div>
        `}
      </div>
    </div>
  `;
};

export default TrackProgress;