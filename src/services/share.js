// src/services/share.js
export const shareTrip = (itinerary) => {
  if (!itinerary) return false;
  
  const text = `✈️ My Trip to ${itinerary.destination}\n\n` +
    `📅 ${itinerary.days} Days\n` +
    `🌟 Highlights:\n${itinerary.attractions.map(a => `• ${a}`).join('\n')}\n\n` +
    `🌍 Plan your trip with Wanderly Travel!\n🔗 ${window.location.href}`;
  
  // Use Web Share API (works on mobile)
  if (navigator.share) {
    navigator.share({
      title: `My Trip to ${itinerary.destination}`,
      text: text,
      url: window.location.href
    }).catch(() => console.log('Share cancelled'));
    return true;
  }
  
  // Fallback: Copy to clipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('📋 Itinerary copied to clipboard! Share it anywhere.');
    });
    return true;
  }
  
  // Final fallback: Open share dialog
  const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(shareUrl, '_blank');
  return true;
};

export const shareViaWhatsApp = (itinerary) => {
  if (!itinerary) return;
  
  const text = `✈️ My Trip to ${itinerary.destination}\n\n` +
    `📅 ${itinerary.days} Days\n` +
    `🌟 ${itinerary.attractions.slice(0, 3).join(' • ')}\n\n` +
    `🌍 Plan your trip with Wanderly Travel!`;
  
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

export const shareViaEmail = (itinerary) => {
  if (!itinerary) return;
  
  const subject = `My Trip to ${itinerary.destination}`;
  const body = `✈️ Trip to ${itinerary.destination}\n\n` +
    `📅 ${itinerary.days} Days\n` +
    `🌟 Highlights:\n${itinerary.attractions.map(a => `• ${a}`).join('\n')}\n\n` +
    `🌍 Plan your trip with Wanderly Travel!\n\n${window.location.href}`;
  
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const generateShareableLink = (itinerary) => {
  if (!itinerary) return null;
  
  // Generate a unique ID for this itinerary
  const id = Date.now().toString(36);
  const data = {
    destination: itinerary.destination,
    days: itinerary.days,
    attractions: itinerary.attractions.slice(0, 3),
    timestamp: new Date().toISOString()
  };
  
  // Save to localStorage for retrieval
  const saved = JSON.parse(localStorage.getItem('sharedItineraries') || '{}');
  saved[id] = data;
  localStorage.setItem('sharedItineraries', JSON.stringify(saved));
  
  return `${window.location.origin}/share/${id}`;
};