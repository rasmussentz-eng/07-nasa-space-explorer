// Find the main elements we will use from the page.
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const factText = document.getElementById('spaceFact');

// Use DEMO_KEY for now. Replace this with your own NASA API key later.
const apiKey = 'DEMO_KEY';

// A small array of fun space facts shown on page load.
const spaceFacts = [
  'The Moon is slowly drifting away from Earth by about 3.8 cm each year.',
  'A day on Venus is longer than a year on Venus.',
  'Neutron stars are so dense that a teaspoon of their material would weigh billions of tons.',
  'Jupiter has a storm that has been raging for hundreds of years.',
  'The Sun makes up about 99.8% of the mass of our solar system.'
];

// Show a random fact when the page loads.
function showRandomFact() {
  const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  factText.textContent = randomFact;
}

// This function builds the URL to ask NASA for APOD data.
function buildApiUrl(startDate, endDate) {
  return `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;
}

// Show a loading message in the gallery before the data arrives.
function showLoadingMessage() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🚀</div>
      <p>Loading space discoveries from NASA...</p>
    </div>
  `;
}

// Create a gallery card for each APOD result.
function createCard(item) {
  const card = document.createElement('article');
  card.className = 'gallery-item';

  const mediaType = item.media_type === 'video' ? 'Video' : 'Image';
  const mediaHTML = item.media_type === 'video'
    ? `<iframe src="${item.url}" title="${item.title}"></iframe>`
    : `<img src="${item.url}" alt="${item.title}" />`;

  card.innerHTML = `
    <div class="media-badge">${mediaType}</div>
    ${mediaHTML}
    <h3>${item.title}</h3>
    <p class="date-label">${item.date}</p>
  `;

  card.addEventListener('click', () => openModal(item));
  return card;
}

// Open the modal and fill it with a larger media item and details.
function openModal(item) {
  const mediaType = item.media_type === 'video' ? 'video' : 'image';
  let mediaContent = '';

  if (mediaType === 'video') {
    mediaContent = `<iframe class="modal-media" src="${item.url}" title="${item.title}"></iframe>`;
  } else {
    mediaContent = `<img class="modal-media" src="${item.url}" alt="${item.title}" />`;
  }

  modalBody.innerHTML = `
    ${mediaContent}
    <h3 id="modalTitle">${item.title}</h3>
    <p><strong>Date:</strong> ${item.date}</p>
    <p>${item.explanation}</p>
  `;

  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

// Close the modal when the user clicks the close button or outside the content.
function closeModal() {
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

// Fetch APOD data from NASA for the selected date range.
async function fetchApodData() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Basic validation so the user picks a valid date range.
  if (!startDate || !endDate) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>Please choose both dates before searching.</p>
      </div>
    `;
    return;
  }

  showLoadingMessage();

  try {
    const response = await fetch(buildApiUrl(startDate, endDate));

    if (!response.ok) {
      throw new Error('The NASA API could not load data right now.');
    }

    const data = await response.json();

    gallery.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      gallery.innerHTML = `
        <div class="placeholder">
          <div class="placeholder-icon">🌌</div>
          <p>No APOD images were found for that date range.</p>
        </div>
      `;
      return;
    }

    data.forEach((item) => {
      const card = createCard(item);
      gallery.appendChild(card);
    });
  } catch (error) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🌠</div>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Call the setupDateInputs function from dateRange.js.
// This sets up the date pickers with NASA-friendly defaults.
setupDateInputs(startInput, endInput);
showRandomFact();

// When the button is clicked, fetch and display the APOD results.
button.addEventListener('click', fetchApodData);

// Close the modal if the user clicks the close button.
modalClose.addEventListener('click', closeModal);

// Close the modal if the user clicks outside the modal content.
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Close the modal with the Escape key.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});
