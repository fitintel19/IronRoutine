import { html } from 'https://esm.sh/htm/preact';

/**
 * Upgrade Modal Component
 * 
 * Displays a modal for upgrading to premium subscription
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onUpgrade - Function to handle the upgrade action
 * @param {boolean} props.loading - Loading state during upgrade process
 * @param {Object|null} props.userSubscription - User's current subscription information
 */
const UpgradeModal = ({ onClose, onUpgrade, loading, userSubscription }) => {
  return html`
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 999999; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; color: black; padding: 40px; border-radius: 15px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
        <!-- Close Button -->
        <button onClick=${onClose} style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
        
        <!-- Header -->
        <h2 style="font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #333;">Upgrade to Premium</h2>
        
        <!-- Price -->
        <div style="margin-bottom: 20px;">
          <span style="font-size: 36px; font-weight: bold; color: #333;">$9.99</span>
          <span style="font-size: 18px; color: #666;">/month</span>
        </div>
        <div style="color: #8b5cf6; font-weight: 500; margin-bottom: 25px;">7-day free trial</div>
        
        <!-- Features -->
        <div style="text-align: left; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="color: #22c55e; margin-right: 10px; font-size: 18px;">✓</span>
            <span>Unlimited AI workout generation</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="color: #22c55e; margin-right: 10px; font-size: 18px;">✓</span>
            <span>Advanced progress analytics</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="color: #22c55e; margin-right: 10px; font-size: 18px;">✓</span>
            <span>AI nutrition planning</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="color: #22c55e; margin-right: 10px; font-size: 18px;">✓</span>
            <span>Priority customer support</span>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="color: #22c55e; margin-right: 10px; font-size: 18px;">✓</span>
            <span>Cancel anytime</span>
          </div>
        </div>
        
        <!-- Upgrade Button -->
        <button 
          onClick=${onUpgrade} 
          disabled=${loading}
          style="width: 100%; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; border: none; padding: 15px 30px; font-size: 18px; font-weight: bold; border-radius: 10px; cursor: pointer; margin-bottom: 15px; ${loading ? 'opacity: 0.7;' : ''}"
        >
          ${loading ? 'Processing...' : 'Start 7-Day Free Trial'}
        </button>
        
        <!-- PayPal Info -->
        <div style="font-size: 14px; color: #666; display: flex; align-items: center; justify-content: center;">
          <span style="margin-right: 5px;">🔒</span>
          Secure checkout powered by PayPal
        </div>
        <div style="font-size: 12px; color: #666; margin-top: 5px;">No commitment • Cancel anytime</div>
      </div>
    </div>
  `;
};

export default UpgradeModal;