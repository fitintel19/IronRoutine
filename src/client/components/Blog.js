import { html } from 'https://esm.sh/htm/preact';
import { useState, useEffect } from 'https://esm.sh/preact/hooks';
import MarkdownIt from 'https://esm.sh/markdown-it';
import { trackEvent, formatDate, formatBlogContent } from '../utils.js';

// Initialize markdown-it with enhanced styling
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// Create a wrapper for formatBlogContent that returns HTML
const formatBlogContentElement = (content) => {
  if (!content) return '';
  
  try {
    const htmlContent = formatBlogContent(content, md);
    return html`<div dangerouslySetInnerHTML=${{ __html: htmlContent }}></div>`;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    // Fallback to plain text
    return html`<p class="text-gray-300 mb-4 leading-relaxed">${content}</p>`;
  }
};

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBlogPosts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const url = selectedCategory
        ? `/api/blog?category=${selectedCategory}`
        : '/api/blog';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data.posts || []);
      } else if (data.error) {
        console.error('Blog posts API error:', data.error);
        // Still set empty posts array to avoid showing loading indefinitely
        setPosts([]);
      } else {
        console.error('Blog posts API response not OK:', response.status);
        setPosts([]);
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
      // Set empty posts array on error to avoid showing loading indefinitely
      setPosts([]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data || []);
      } else if (data.error) {
        console.error('Categories API error:', data.error);
        // Set default categories if API fails
        setCategories([
          { id: '1', name: 'Fitness', slug: 'fitness' },
          { id: '2', name: 'Workouts', slug: 'workouts' },
          { id: '3', name: 'Nutrition', slug: 'nutrition' }
        ]);
      } else {
        console.error('Categories API response not OK:', response.status);
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Set default categories on error
      setCategories([
        { id: '1', name: 'Fitness', slug: 'fitness' },
        { id: '2', name: 'Workouts', slug: 'workouts' },
        { id: '3', name: 'Nutrition', slug: 'nutrition' }
      ]);
    }
  };

  const fetchPost = async (slug) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog/${slug}`);
      const data = await response.json();
      
      if (response.ok && !data.error) {
        setSelectedPost(data);
        
        // Track blog post view
        trackEvent('blog_post_view', {
          blog_title: data.title,
          blog_category: data.category
        });
      } else {
        console.error('Blog post API error:', data.error || 'Unknown error');
        // Return to post list on error
        setSelectedPost(null);
      }
    } catch (error) {
      console.error('Failed to fetch blog post:', error);
      // Return to post list on error
      setSelectedPost(null);
    }
    setLoading(false);
  };

  const formatBlogDate = (dateString) => {
    return formatDate(dateString, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Single post view
  if (selectedPost) {
    return html`
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick=${() => setSelectedPost(null)}
          class="mb-8 flex items-center px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-gray-700/50 hover:border-purple-500/30 transition-all duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Blog
        </button>
        
        <article class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 lg:p-12 border border-gray-700 shadow-xl">
          <header class="mb-8">
            <div class="flex items-center space-x-4 mb-4">
              <span class="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                ${selectedPost.category}
              </span>
              <time class="text-gray-400 text-sm">
                ${formatBlogDate(selectedPost.published_at)}
              </time>
            </div>
            
            <h1 class="text-4xl font-bold text-white mb-4">
              ${selectedPost.title}
            </h1>
            
            ${selectedPost.excerpt && html`
              <p class="text-xl text-gray-300 mb-6">
                ${selectedPost.excerpt}
              </p>
            `}
          </header>
          
          <div class="prose prose-invert prose-lg max-w-none">
            <div class="blog-content text-gray-300 leading-relaxed">
              ${formatBlogContentElement(selectedPost.content)}
            </div>
          </div>
          
          ${selectedPost.tags && selectedPost.tags.length > 0 && html`
            <footer class="mt-8 pt-6 border-t border-gray-700">
              <div class="flex items-center space-x-2">
                <span class="text-gray-400 text-sm">Tags:</span>
                ${selectedPost.tags.map(tag => html`
                  <span key=${tag} class="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                    ${tag}
                  </span>
                `)}
              </div>
            </footer>
          `}
        </article>
      </div>
    `;
  }

  // Blog list view
  return html`
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <div class="mb-6">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4 leading-normal">
            Fitness Knowledge Hub
          </h1>
          <div class="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mb-6"></div>
        </div>
        <p class="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Expert tips, workout guides, and fitness insights to help you reach your goals and transform your life
        </p>
      </div>

      <!-- Enhanced Category Filter -->
      <div class="mb-20">
        <div class="flex flex-wrap justify-center gap-4">
          <button
            onClick=${() => setSelectedCategory('')}
            class=${`${(!selectedCategory
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105 border-0'
              : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:border-purple-500/30 hover:text-white'
            ) + ' px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105'}`}
          >
            <span class="flex items-center space-x-2">
              <span>📚</span>
              <span>All Posts</span>
            </span>
          </button>
          ${categories.map(category => {
            const icons = {
              fitness: '🎯',
              workouts: '💪', 
              nutrition: '🥗',
              equipment: '🏋️',
              motivation: '🔥'
            };
            return html`
              <button
                key=${category.slug}
                onClick=${() => setSelectedCategory(category.slug)}
                class=${`${(selectedCategory === category.slug
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105 border-0'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:border-purple-500/30 hover:text-white'
                ) + ' px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105'}`}
              >
                <span class="flex items-center space-x-2">
                  <span>${icons[category.slug] || '📝'}</span>
                  <span>${category.name}</span>
                </span>
              </button>
            `;
          })}
        </div>
      </div>

      <!-- Blog Posts Grid -->
      ${loading ? html`
        <div class="text-center py-12">
          <div class="text-4xl mb-4">📝</div>
          <p class="text-gray-400">Loading blog posts...</p>
        </div>
      ` : html`
        ${posts.length > 0 ? html`
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            ${posts.map(post => html`
              <article
                key=${post.id}
                class="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-purple-500/30 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick=${() => fetchPost(post.slug)}
              >
                <!-- Simple Header with Icon -->
                <div class="p-6 pb-4">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="text-3xl">
                        ${post.category === 'workouts' ? '💪' :
                          post.category === 'nutrition' ? '🥗' :
                          post.category === 'equipment' ? '🏋️' :
                          post.category === 'motivation' ? '🔥' : '🎯'}
                      </div>
                      <div>
                        <span class="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                          ${post.category}
                        </span>
                      </div>
                    </div>
                    <time class="text-gray-500 text-xs">
                      ${formatBlogDate(post.published_at)}
                    </time>
                  </div>
                  
                  <h2 class="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors leading-tight">
                    ${post.title}
                  </h2>
                  
                  ${post.excerpt && html`
                    <p class="text-gray-400 text-sm mb-4 leading-relaxed">
                      ${post.excerpt}
                    </p>
                  `}
                  
                  <!-- Tags -->
                  ${post.tags && post.tags.length > 0 && html`
                    <div class="flex flex-wrap gap-2 mb-4">
                      ${post.tags.slice(0, 3).map(tag => html`
                        <span key=${tag} class="bg-purple-600/10 border border-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                          #${tag}
                        </span>
                      `)}
                    </div>
                  `}
                  
                  <!-- Read More Button -->
                  <div class="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <span class="text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors flex items-center">
                      Read More
                      <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </span>
                    <div class="text-gray-500 text-xs">
                      ${Math.ceil(post.content?.length / 1000) || 3} min read
                    </div>
                  </div>
                </div>
              </article>
            `)}
          </div>
        ` : html`
          <div class="text-center py-12">
            <div class="text-4xl mb-4">📝</div>
            <h3 class="text-xl font-semibold text-white mb-2">No Blog Posts Yet</h3>
            <p class="text-gray-400">
              ${selectedCategory
                ? 'No posts found in this category. Try selecting a different category.'
                : 'Blog posts will appear here soon. Check back later for fitness tips and guides!'
              }
            </p>
          </div>
        `}
      `}
    </div>
  `;
};

export default Blog;