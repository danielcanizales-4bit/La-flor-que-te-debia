import './styles/main.css';
import { flowersData, letterContent } from './data/flowers.js';

class App {
  constructor() {
    this.appElement = document.getElementById('app');
    this.currentScene = 0;
    this.discoveredFlowers = new Set();
    this.audioElement = null;
    this.isMuted = true;
    
    this.init();
  }

  init() {
    this.render();
    this.setupAudio();
    this.createParticles();
    this.showScene('intro');
  }

  render() {
    this.appElement.innerHTML = `
      <div id="audio-btn" class="audio-controls">🔇</div>
      
      <div class="particles-container" id="particles"></div>

      <!-- Scene 1: Intro -->
      <div id="scene-intro" class="scene scene-intro">
        <div style="font-size: 3rem; margin-bottom: 20px;">🌻</div>
        <h1>La flor que te debía</h1>
        <p>Isabel, tengo algo que decirte...</p>
        <button id="btn-open">Abrir</button>
      </div>

      <!-- Scene 2 & 3: Garden -->
      <div id="scene-garden" class="scene scene-garden">
        <div class="garden-message" id="garden-message">
          <h2>Te debía una flor...</h2>
          <p>Así que decidí hacerte un jardín entero.</p>
        </div>
        <div class="flowers-container" id="flowers-container"></div>
        <div class="continue-btn-container" id="continue-container">
          <p style="margin-bottom: 10px;">Has encontrado todas.</p>
          <button id="btn-continue-letter">Continuar 🌻</button>
        </div>
      </div>

      <!-- Scene 4: Letter -->
      <div id="scene-letter" class="scene scene-letter">
        <div class="letter-content" id="letter-content">
          <!-- Letter lines will be injected here -->
        </div>
      </div>

      <!-- Scene 5: Final Flower -->
      <div id="scene-final" class="scene scene-final">
        <div id="final-intro" style="transition: opacity 1s;">
          <h2 style="font-size: 1.5rem; margin-bottom: 10px;">Pero todavía falta una...</h2>
          <p>La que te debía.</p>
        </div>
        
        <div class="final-flower-container" id="final-flower-btn" style="opacity:0; pointer-events:none; transition: opacity 1s;">
          <div class="final-flower">
            ${this.getFlowerSVG(80)}
          </div>
        </div>

        <div class="final-message" id="final-message">
          <h2>🌻 Esta es la flor que te debía.</h2>
          <p>Y si algún día vuelves aquí,</p>
          <p>quiero que recuerdes que detrás de esta pantalla</p>
          <p>hubo alguien que se sentó a programar todo esto</p>
          <p>pensando únicamente en ti.</p>
          <p class="highlight" style="color: var(--primary-color); font-size: 1.4rem; margin-top: 20px;">Te quiero, Isabel. ❤️</p>
          
          <div class="end-options">
            <button id="btn-restart-garden">Volver a ver el jardín</button>
            <button id="btn-restart">Volver al inicio</button>
          </div>
          <p class="author">Hecho con ❤️ por Daniel</p>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" id="modal">
        <div class="message-card">
          <h3 id="modal-title">Título</h3>
          <p id="modal-text">Mensaje...</p>
          <button class="close-btn" id="btn-close-modal">Cerrar</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  setupAudio() {
    this.audioElement = new Audio('/audio/music.mp3');
    this.audioElement.loop = true;
    
    const audioBtn = document.getElementById('audio-btn');
    audioBtn.addEventListener('click', () => {
      if (this.isMuted) {
        // Try to play
        this.audioElement.play().then(() => {
          this.isMuted = false;
          audioBtn.textContent = '🔊';
        }).catch(e => {
          console.log("Audio not found or blocked", e);
        });
      } else {
        this.audioElement.pause();
        this.isMuted = true;
        audioBtn.textContent = '🔇';
      }
    });
  }

  playAudioIfAllowed() {
    if (this.isMuted && this.audioElement.paused) {
      this.audioElement.play().then(() => {
        this.isMuted = false;
        document.getElementById('audio-btn').textContent = '🔊';
      }).catch(e => {
        // User hasn't interacted enough or file missing, ignore
      });
    }
  }

  createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      const size = Math.random() * 5 + 2;
      particle.style.width = size + "px";
      particle.style.height = size + "px";
      
      particle.style.left = (Math.random() * 100) + "vw";
      
      const duration = Math.random() * 10 + 10;
      particle.style.animationDuration = duration + "s";
      
      const delay = Math.random() * 10;
      particle.style.animationDelay = delay + "s";
      
      container.appendChild(particle);
    }
  }

  getFlowerSVG(size = 50) {
    let petalsHTML = '';
    for(let i=0; i<12; i++) {
        petalsHTML += '<path class="petal" d="M0,0 Q10,-30 0,-40 Q-10,-30 0,0" transform="rotate(' + (i * 30) + ')" />';
    }

    return '<svg width="' + size + '" height="' + (size * 1.5) + '" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">' +
        '<path class="stem" d="M50,75 Q40,110 50,150" fill="none" />' +
        '<path class="leaf" d="M50,120 Q30,120 35,100 Q45,110 50,120" />' +
        '<path class="leaf" d="M50,105 Q70,100 65,85 Q55,95 50,105" />' +
        '<g transform="translate(50, 45)">' +
          petalsHTML +
          '<circle class="center" cx="0" cy="0" r="12" />' +
        '</g>' +
      '</svg>';
  }

  bindEvents() {
    document.getElementById('btn-open').addEventListener('click', () => {
      this.playAudioIfAllowed();
      this.showGarden();
    });

    document.getElementById('btn-close-modal').addEventListener('click', () => {
      document.getElementById('modal').classList.remove('active');
      this.checkAllFlowersFound();
    });

    document.getElementById('btn-continue-letter').addEventListener('click', () => {
      this.showLetter();
    });
    
    document.getElementById('btn-restart-garden').addEventListener('click', () => {
      this.discoveredFlowers.clear();
      this.showGarden();
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      this.discoveredFlowers.clear();
      this.showScene('intro');
    });
  }

  hideAllScenes() {
    document.querySelectorAll('.scene').forEach(scene => {
      scene.classList.remove('active');
    });
  }

  showScene(sceneId) {
    this.hideAllScenes();
    setTimeout(() => {
      document.getElementById('scene-' + sceneId).classList.add('active');
    }, 500); // Wait for fade out
  }

  showGarden() {
    this.showScene('garden');
    this.discoveredFlowers.clear();
    
    const container = document.getElementById('flowers-container');
    container.innerHTML = '';
    document.getElementById('continue-container').classList.remove('visible');
    
    // Plant decorative background flowers
    const bgFlowersCount = 25;
    for (let i = 0; i < bgFlowersCount; i++) {
      const bgFlower = document.createElement('div');
      bgFlower.classList.add('flower');
      bgFlower.innerHTML = this.getFlowerSVG(20 + Math.random() * 15);
      
      bgFlower.style.left = (Math.random() * 95) + "%";
      bgFlower.style.bottom = (10 + Math.random() * 50) + "px";
      bgFlower.style.opacity = "0.5";
      bgFlower.style.filter = "blur(1px) brightness(0.6)";
      bgFlower.style.zIndex = "1";
      bgFlower.style.animationDelay = (Math.random() * 2) + "s";
      bgFlower.style.pointerEvents = "none";
      
      container.appendChild(bgFlower);
    }
    
    // Plant interactive flowers
    setTimeout(() => {
      flowersData.forEach((flower, index) => {
        const flowerEl = document.createElement('div');
        flowerEl.classList.add('flower');
        flowerEl.innerHTML = this.getFlowerSVG(45 + Math.random() * 15);
        
        // Spread them out evenly to avoid overlap
        const segmentSize = 90 / flowersData.length;
        const leftPos = 5 + (segmentSize * index) + (Math.random() * (segmentSize * 0.4));
        flowerEl.style.left = leftPos + "%";
        
        // Alternate heights and depths
        flowerEl.style.bottom = (5 + (index % 3) * 15 + Math.random() * 10) + "px";
        flowerEl.style.zIndex = (10 + index).toString();
        flowerEl.style.animationDelay = (index * 0.3) + "s";
        
        flowerEl.addEventListener('click', () => {
          this.openFlowerModal(flower, flowerEl);
        });
        
        container.appendChild(flowerEl);
      });
      
      setTimeout(() => {
        document.getElementById('garden-message').classList.add('visible');
      }, 2000);
    }, 1000);
  }

  openFlowerModal(flowerData, flowerElement) {
    flowerElement.classList.add('discovered');
    this.discoveredFlowers.add(flowerData.id);
    
    document.getElementById('modal-title').textContent = flowerData.category;
    document.getElementById('modal-text').textContent = flowerData.message;
    
    document.getElementById('modal').classList.add('active');
  }

  checkAllFlowersFound() {
    if (this.discoveredFlowers.size === flowersData.length) {
      document.getElementById('garden-message').classList.remove('visible');
      setTimeout(() => {
        document.getElementById('continue-container').classList.add('visible');
      }, 1000);
    }
  }

  showLetter() {
    this.showScene('letter');
    const container = document.getElementById('letter-content');
    container.innerHTML = '';
    
    letterContent.forEach((line, index) => {
      const p = document.createElement('p');
      p.classList.add('letter-line');
      p.textContent = line;
      if (index === letterContent.length - 1) {
        p.classList.add('highlight');
      }
      container.appendChild(p);
      
      setTimeout(() => {
        p.classList.add('visible');
      }, 1000 + (index * 1500));
    });
    
    // Total time for letter reading before next scene
    const totalTime = 1000 + (letterContent.length * 1500) + 4000;
    setTimeout(() => {
      this.showFinalScene();
    }, totalTime);
  }

  showFinalScene() {
    this.showScene('final');
    
    document.getElementById('final-intro').style.opacity = '1';
    document.getElementById('final-flower-btn').style.opacity = '0';
    document.getElementById('final-flower-btn').style.pointerEvents = 'none';
    document.getElementById('final-message').classList.remove('visible');
    
    setTimeout(() => {
      document.getElementById('final-intro').style.opacity = '0';
      
      setTimeout(() => {
        const finalFlowerBtn = document.getElementById('final-flower-btn');
        finalFlowerBtn.style.opacity = '1';
        finalFlowerBtn.style.pointerEvents = 'auto';
        
        // Single listener
        const onClickFinal = () => {
          finalFlowerBtn.removeEventListener('click', onClickFinal);
          document.getElementById('final-message').classList.add('visible');
          
          // Small animation on final flower
          const svg = finalFlowerBtn.querySelector('.final-flower');
          svg.style.transform = 'scale(1.8)';
          svg.style.filter = 'drop-shadow(0 0 30px var(--primary-color))';
        };
        
        finalFlowerBtn.addEventListener('click', onClickFinal);
        
      }, 1500);
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
