// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Car grid (home page)
if (document.getElementById('carGrid')) {
  renderCarGrid();
}

// Default booking dates
(function setDefaultDates() {
  const pickupDate = document.getElementById('pickupDate');
  const dropoffDate = document.getElementById('dropoffDate');
  if (!pickupDate || !dropoffDate) return;
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const toISODate = d => d.toISOString().split('T')[0];
  pickupDate.min = toISODate(today);
  dropoffDate.min = toISODate(today);
  pickupDate.value = toISODate(today);
  dropoffDate.value = toISODate(tomorrow);
  pickupDate.addEventListener('change', () => {
    dropoffDate.min = pickupDate.value;
    if (dropoffDate.value < pickupDate.value) dropoffDate.value = pickupDate.value;
  });
})();

// Booking search form → scroll to contact / redirect
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', e => {
    e.preventDefault();
    const contact = document.getElementById('contact');
    if (contact) contact.scrollIntoView({ behavior: 'smooth' });
    else window.location.href = 'contact.html';
  });
}

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-q');
  if (!question) return;
  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
    if (!isOpen) item.classList.add('active');
  });
});

// Contact / inquiry form (index.html — simple inline form)
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
if (contactForm && formNote) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const [nameEl, phoneEl] = contactForm.querySelectorAll('.form-row:first-child input');
    const [cityEl] = contactForm.querySelectorAll('.form-row:nth-child(2) input');
    if (nameEl && phoneEl && cityEl) {
      saveInquiry({ name: nameEl.value, phone: phoneEl.value, city: cityEl.value });
    }
    formNote.textContent = "Thanks! We'll call you shortly to confirm your booking.";
    contactForm.reset();
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
