import { html } from 'https://esm.sh/htm/preact';

/**
 * Home component for the IronRoutine application
 * Displays the landing page with feature highlights
 */
const Home = () => {
  return html`
    <div class="text-center">
      <div class="max-w-3xl mx-auto">
        <div class="flex justify-center mb-4 sm:mb-6 lg:mb-8">
          <img src="/logo.png?v=7" alt="IronRoutine Logo" class="h-32 w-32 sm:h-48 sm:w-48 lg:h-64 lg:w-64 rounded-xl" style="object-fit: contain; object-position: center;" />
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          Transform Your Fitness Journey
        </h1>
        <p class="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
          AI-powered workout generation, smart progress tracking, and personalized fitness insights.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8 lg:mt-12">
          <div class="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div class="text-purple-400 text-3xl mb-4">🤖</div>
            <h3 class="text-xl font-semibold mb-2">AI-Generated Workouts</h3>
            <p class="text-gray-300">Custom workouts tailored to your goals and fitness level</p>
          </div>
          <div class="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div class="text-purple-400 text-3xl mb-4">📊</div>
            <h3 class="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p class="text-gray-300">Monitor your improvements with detailed analytics</p>
          </div>
          <div class="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div class="text-purple-400 text-3xl mb-4">🎯</div>
            <h3 class="text-xl font-semibold mb-2">Goal Achievement</h3>
            <p class="text-gray-300">Set and crush your fitness milestones</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default Home;