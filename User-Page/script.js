// Auto-fills the copyright year in the footer, so you never
// have to manually update it.
document.getElementById('year').textContent = new Date().getFullYear();

// ---------------------------------------------------------
// HERO IMAGE CAROUSEL
// Auto-rotates through the 4 product photos in the hero box
// every 4 seconds, with a smooth fade between them.
// ---------------------------------------------------------
(function () {
  // Grabs all <img> tags inside the element with id="hero-carousel"
  var slides = document.querySelectorAll('#hero-carousel img');
  var current = 0; // index of the image currently showing

  if (slides.length > 1) {
    setInterval(function () {
      slides[current].classList.remove('active'); // fade out current image
      current = (current + 1) % slides.length;      // move to next (loops back to 0 at the end)
      slides[current].classList.add('active');      // fade in the next image
    }, 4000); // 4000ms = 4 seconds between switches — change this number to speed up/slow down
  }
})();

// ---------------------------------------------------------
// HOMEPAGE COVER PHOTOS
// Checks each category card for a photo marked as the cover
// in the admin page, and swaps it in if one exists.
// ---------------------------------------------------------
document.querySelectorAll('.case-card').forEach(async function (card) {
  if (!sb) return;

  const url = new URL(card.href);
  const category = url.searchParams.get('category');
  if (!category) return;

  const { data, error } = await sb
    .from('gallery_items')
    .select('image_url')
    .eq('category', category)
    .eq('is_cover', true)
    .limit(1);

  if (!error && data && data.length > 0) {
    const img = card.querySelector('.case-photo');
    if (img) img.src = data[0].image_url;
  }
});

