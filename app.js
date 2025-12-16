document.addEventListener("DOMContentLoaded", async () => {
  const pickBtn = document.getElementById("pickBtn");
  const result = document.getElementById("result");
  const globe = document.querySelector(".background-globe");

  // DECLARAÇÕES:
  let data = null; // Para countries_books.json
  let countryGeoData = {}; // Para as coordenadas
  
  // 1. MELHORIA #1: MAPA PARA CORRIGIR INCOMPATIBILIDADE DE NOMES
  const countryNameMap = {
      // Formato: "Nome_no_arquivo_de_livros": "Nome_exato_no_arquivo_de_coordenadas"
      "UK": "United Kingdom",
      "USA": "United States",
      // Adicione mais mapeamentos aqui conforme o console acusar "Geo data missing"
      "Congo (DRC)": "Congo, The Democratic Republic of the", 
      "República Checa": "Czech Republic", 
      "Rússia": "Russia", 
  }; 

  function createRipple(target, x, y) {
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (x - rect.left - size / 2) + "px";
    ripple.style.top = (y - rect.top - size / 2) + "px";
    target.appendChild(ripple);
    requestAnimationFrame(() => {
      ripple.style.transform = "scale(1)";
      ripple.style.opacity = "0.14";
    });
    setTimeout(() => {
      ripple.style.opacity = "0";
      ripple.style.transform = "scale(1.3)";
    }, 260);
    setTimeout(() => ripple.remove(), 700);
  }

  // A função pokeGlobe FOI REMOVIDA daqui. Ela será adicionada ao js-three-globe.js

  // BLOCO TRY/CATCH COM CARREGAMENTO PARALELO:
  try {
    const [booksData, geoDataContainer] = await Promise.all([
        fetch("./countries_books.json").then(r => r.json()),
        fetch("./country-codes-lat-long-alpha3.json").then(r => r.json())
    ]);
    
    data = booksData;
    const geoList = geoDataContainer.ref_country_codes;
    
    countryGeoData = geoList.reduce((acc, current) => {
        acc[current.country] = {
            lat: parseFloat(current.latitude),
            lon: parseFloat(current.longitude)
        };
        return acc;
    }, {});

  } catch (err) {
    console.error("Error loading data:", err);
    renderError("FATAL ERROR: Could not load necessary data. Check file names, paths, and JSON validity.");
    return;
  }

  // Lógica principal do clique (agora usando o Mapeamento)
  pickBtn.addEventListener("pointerdown", (ev) => {
    createRipple(pickBtn, ev.clientX, ev.clientY);
  });

  pickBtn.addEventListener("click", () => {
    
    pickBtn.disabled = true;
    pickBtn.setAttribute("aria-disabled", "true");

    const randomCountry = getRandomKey(data);
    const books = data[randomCountry]?.books || [];
    renderCard(randomCountry, books);
    
    // 2. MELHORIA #1: Aplica o Mapeamento de Nomes
    // Se o nome do país estiver no mapa, usa o nome mapeado; caso contrário, usa o nome original.
    const geoKey = countryNameMap[randomCountry] || randomCountry; 
    
    const geo = countryGeoData[geoKey]; // Busca usando a chave mapeada
    
    // 3. MELHORIA #3: Usa a nova função global pokeGlobe, se existir.
    if (geo && window.globeControls && window.globeControls.spinToCountry) {
        window.globeControls.spinToCountry(geo.lat, geo.lon);
    } else if (window.globeControls && window.globeControls.pokeGlobe) {
        window.globeControls.pokeGlobe();
        console.warn(`Geo data missing for ${randomCountry} (Checked key: ${geoKey}). Check the countryNameMap.`);
    } else {
        // Fallback final, caso a função pokeGlobe não exista em js-three-globe.js
        console.error("Globe controls not initialized. Check js-three-globe.js.");
    }
    
    setTimeout(() => {
      pickBtn.disabled = false;
      pickBtn.removeAttribute("aria-disabled");
      pickBtn.focus();
    }, 520); 
  });


  pickBtn.addEventListener("keyup", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      pickBtn.click();
    }
  });

  function getRandomKey(obj) {
    const keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  function renderCard(country, books) {
    result.innerHTML = `
      <article class="card" role="article" aria-label="Books from ${escapeHtml(country)}">
        <header class="card-header">
          <h4>
            <span class="material-icons" aria-hidden="true">flight_takeoff</span>
            Your next literary destination
          </h4>
          <h2>
            <span class="material-icons" aria-hidden="true">place</span>
            ${escapeHtml(country)}
          </h2>
        </header>
        ${
          books.length
            ? `
              <p class="books-intro" style="margin:6px 0 8px 0;">
                Discover these picks
              </p>
              <ul>
                ${books.map(b => `
                  <li>
                    <span class="material-icons" aria-hidden="true">menu_book</span>
                    <span>${escapeHtml(b)}</span>
                  </li>`).join("")}
              </ul>`
            : `
              <p class="text-muted" role="status">
                <span class="material-icons" aria-hidden="true">search_off</span>
                No books listed yet for this country
              </p>`
        }
      </article>
    `;

    const card = result.querySelector(".card");
    if (card) {
      card.tabIndex = -1;
      card.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        setTimeout(() => card.classList.add("pop-in"), 15);
      });

      card.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape") {
          pickBtn.focus();
        }
      });
    }
  }

  function renderError(message) {
    result.innerHTML = `
      <article class="card" role="alert">
        <p class="text-danger">
          <span class="material-icons" aria-hidden="true">error</span>
          ${escapeHtml(message)}
        </p>
      </article>
    `;
    const card = result.querySelector(".card");
    if (card) {
      card.classList.add("pop-in");
      card.tabIndex = -1;
      card.focus({ preventScroll: true });
    }
  }

  function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[&<>"'`=\/]/g, function(s) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
      })[s];
    });
  }
});