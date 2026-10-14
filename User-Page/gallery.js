// ===========================================================
// GALLERY PAGE
// Each category page shows two kinds of photos:
//   1) Photos your client uploaded from admin.html (newest first)
//   2) The "starter" photos below that came with the website
// ===========================================================

// Titles + intro text for each section, and the starter photos.
// The starter photos are the ones already inside your images/ folder.
// (New photos no longer need to be listed here. Upload them from
// admin.html instead.)
const GALLERIES = {
  cakes: {
    title: 'Cakes',
    intro: 'A look at cakes we\u2019ve made so far \u2014 custom designs, flavors, and finishes for every kind of celebration.',
    starterImages: [
      'Cake(cup).jpg',
      'Cake(Nig.cupcake).jpg',
      'Cake(plate).jpg',
      'Cake(W-B).jpg',
      'Cakecupcake).jpg'
    ]
  },
  bread: {
    title: 'Bread',
    intro: 'Fresh loaves and specialty bakes from our kitchen \u2014 baked in small batches, every day.',
    starterImages: [
      'Bread(Section).jpg',
      'Bread(Style).jpg',
      'Bread(wheat).jpg',
      'Bread(white).jpg',
      'Bread Image.jpg'
    ]
  },
  snacks: {
    title: 'Snacks',
    intro: 'Pastries and small bites, perfect on their own or alongside a full event tray.',
    starterImages: [
      'Snack(eggroll).jpg',
      'Snack(samosa).jpg',
      'Snack(sausage roll).jpg',
      'Snacks image.jpg',
      'Snack eggroll.jpg'
    ]
  },
  catering: {
    title: 'Catering',
    intro: 'Past events we\u2019ve catered \u2014 full spreads built around whatever was being celebrated.',
    starterImages: [
      'Catering(Black).jpg',
      'Catering(fried).jpg',
      'Catering(jollof).jpg',
      'Catering(torks).png',
      'Catering(White).jpg'
    ]
  }
};

// ---------------------------------------------------------
// Work out which category to show from the page link,
// e.g. gallery.html?category=cakes
// ---------------------------------------------------------
const params = new URLSearchParams(window.location.search);
const categoryKey = params.get('category');
const gallery = GALLERIES[categoryKey];

const titleEl = document.getElementById('gallery-title');
const introEl = document.getElementById('gallery-intro');
const gridEl = document.getElementById('gallery-grid');

if (!gallery) {
  titleEl.textContent = 'Gallery not found';
  introEl.textContent = 'Head back to the homepage and tap a category (Cakes, Bread, Snacks, or Catering) to see photos.';
} else {
  document.title = gallery.title + ' — Dao Confectiones';
  titleEl.textContent = gallery.title;
  introEl.textContent = gallery.intro;
  showGallery();
}

// Fetches uploaded photos, joins them with the starter photos, and draws the grid
async function showGallery() {
  // Start with the starter photos (these always work, even offline from Supabase)
  const starter = gallery.starterImages.map(function (filename) {
    return {
      src: 'images/' + encodeURIComponent(filename),
      caption: ''
    };
  });

  // Ask Supabase for photos uploaded through the admin page
  let uploaded = [];
  if (sb) {
    const { data, error } = await sb
      .from('gallery_items')
      .select('image_url, caption')
      .eq('category', categoryKey)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Could not load uploaded photos:', error);
    } else if (data) {
      uploaded = data.map(function (row) {
        return { src: row.image_url, caption: row.caption || '' };
      });
    }
  }

  // Newest uploads first, then the starter photos
  drawGrid(uploaded);
}

function drawGrid(items) {
  gridEl.innerHTML = '';

  items.forEach(function (item) {
    const figure = document.createElement('div');
    figure.className = 'gallery-item';

      const photoWrap = document.createElement('div');
    photoWrap.className = 'gallery-photo';

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.caption || (gallery.title + ' — Dao Confectiones');
    img.loading = 'lazy';

    photoWrap.appendChild(img);
    figure.appendChild(photoWrap);

    // Only add a caption strip if a caption was entered in the admin page
    if (item.caption) {
      const cap = document.createElement('div');
      cap.className = 'gallery-caption';
      cap.textContent = item.caption;
      figure.appendChild(cap);
    }

    gridEl.appendChild(figure);
  });
}