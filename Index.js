// === API FUNCTIONS ===
async function fetchAllCountries() {
  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,region,population",
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    showError("Failed to fetch countries.");
    throw error;
  }
}

async function fetchCountryDetails(name) {
  const endpoint = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true&fields=name,capital,languages,currencies,timezones,maps,flags`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Failed to fetch country details");
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Error fetching country details:", error);
    showError("Could not load details.");
  }
}

function renderCountries(countries) {
  const listContainer = document.getElementById("country-list");

  
  listContainer.innerHTML = "";

  
  if (!countries || countries.length === 0) {
    listContainer.innerHTML = "<p>No countries found.</p>";
    return;
  }

  countries.forEach((country) => {
    const card = document.createElement("div");
    card.classList.add("country-card");

    card.innerHTML = `
      <img src="${country.flags.png}" alt="Flag of ${country.name.common}" class="country-flag" />
      <h2 class="country-name">${country.name.common}</h2>
      <p><strong>Region:</strong> ${country.region}</p>
      <p><strong>Population:</strong> ${formatPopulation(country.population)}</p>
    `;

    card.addEventListener("click", () => {
      renderCountryDetails(country);
    });

    listContainer.appendChild(card);
  });
}

async function renderCountryDetails(country) {
  const detailsContainer = document.getElementById("country-details");

  showLoading();
  try {
    const data = await fetchCountryDetails(country.name.common);

    
    detailsContainer.innerHTML = `
      <div class="country-details-card">
        <img src="${data.flags.png}" alt="Flag of ${data.name.common}" class="details-flag"/>
        <h2>${data.name.common}</h2>
        <p><strong>Capital:</strong> ${data.capital ? data.capital.join(", ") : "N/A"}</p>
        <p><strong>Languages:</strong> ${data.languages ? Object.values(data.languages).join(", ") : "N/A"}</p>
        <p><strong>Currencies:</strong> ${
          data.currencies
            ? Object.values(data.currencies)
                .map((c) => c.name)
                .join(", ")
            : "N/A"
        }</p>
        <p><strong>Timezones:</strong> ${data.timezones ? data.timezones.join(", ") : "N/A"}</p>
        <p><a href="${data.maps.googleMaps}" target="_blank">View on Google Maps</a></p>
      </div>
    `;
  } catch (error) {
    showError("Failed to load country details.");
  } finally {
    hideLoading();
  }
}

function showLoading(message = "Loading...") {
  const loadingEl = document.getElementById("loading");
  loadingEl.textContent = message;
  loadingEl.style.display = "block";
}

function hideLoading() {
  const loadingEl = document.getElementById("loading");
  loadingEl.style.display = "none";
}

function showError(message) {
  const errorEl = document.getElementById("error");
  errorEl.textContent = message;
  errorEl.style.display = "block";

  setTimeout(() => {
    errorEl.style.display = "none";
  }, 4000);
}

function handleFilter(event) {
  const selectedRegion = event.target.value;

  if (!selectedRegion) {
    
    renderCountries(window.allCountries);
    return;
  }

  const filtered = window.allCountries.filter(
    (country) => country.region === selectedRegion,
  );

  renderCountries(filtered);
}

function handleSearch(event) {
  const query = event.target.value.toLowerCase().trim();


  if (query === "") {
    renderCountries(window.allCountries);
    return;
  }

  // Filter countries by name
  const filtered = window.allCountries.filter((country) =>
    country.name.common.toLowerCase().includes(query),
  );

  renderCountries(filtered);
}

function setupEventListeners() {
  const searchInput = document.getElementById("search-input");
  const regionFilter = document.getElementById("region-filter");

  searchInput.addEventListener("input", handleSearch);
  regionFilter.addEventListener("change", handleFilter);
}

function formatPopulation(num) {
  return num.toLocaleString(); // e.g. 206139589 → "206,139,589"
}

// App Entry
async function init() {
  showLoading();

  try {
    const countries = await fetchAllCountries();

    renderCountries(countries);

    window.allCountries = countries;
  } catch (error) {
    showError("Failed to load countries. Please try again.");
  } finally {
    hideLoading();
  }

  setupEventListeners();
}

init();