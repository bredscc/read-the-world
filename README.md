# Read the World

This project began in 2023 after a New Year’s resolution pushed me to read more worldwide. But I hit an obstacle: with so many countries out there where should my next book come from?
I wanted a way to discover literature from around the globe without relying on my own biases, something spontaneous, unexpected.
**Read the World** was born from that idea: a simple tool where you press a button, the world spins, and chance decides my next literary destination.
---

## The Experience

This project isn't about generating a random number , it’s about letting chance guide you to new places.

### The Trigger

Click **Spin the Globe** and the system begins a global search.

### The Spectacle

A 3D wireframe globe (built with Three.js) whirls into a fast rotation, as if scanning the entire
planet in seconds.

### The Destination

The globe slows down and locks onto a single country, pulling it directly into the center of the screen with a pulsating marker.

### The Result

A curated list of books from that country appears instantly in a clean, high-contrast panel.

## Design Philosophy: Embracing the Chaos

The design intentionally leans into a glitchy aesthetic, a playful contrast between the “old-school” act of reading and a raw, cyberpunk interface.

- **Aesthetic:** cyberpunk, glitchy, neon
- **Colors:** harsh magenta and cyan for visual friction
- **Typography:** a mix of monospace and heavy brutalist headers
- **Canvas Effects:** distortion filters to make the data feel alive
  Everything is built to feel in motion, like accessing a global literary network running on a forgotten library computer.
  ---

## Tech Stack

- **Three.js** for the 3D globe and rotation mechanics
- **Vanilla JavaScript** for all logic and interactions
- **HTML/CSS** for structure and a heavily stylized UI
- **countries_books.json** as the core dataset.
---

## Running Locally

1. **Clone the repo:**

```bash
git clone https://github.com/bredscc/read-around
cd read-around
```

2. **Check your data file:**
   Make sure `countries_books.json` is present.
3. **Run a local server:**
   (e.g., VS Code Live Server or `python3 -m http.server`)
4. **Spin the globe and discover your next read.**

Feedback and pull requests are welcome.
