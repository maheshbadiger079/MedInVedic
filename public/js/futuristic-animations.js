/**
 * Futuristic UI Animations (Neural Network Particles & Mouse Interactive Nodes)
 * MedInVedic Platinum Design System
 */
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    initNeuralCanvas();
    initTrendChart();
  });

  function initNeuralCanvas() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = Math.min(60, Math.floor((width * height) / 20000));
    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
        this.pulseSeed = Math.random() * 100;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce boundaries
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse attraction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= dx * force * 0.02;
            this.y -= dy * force * 0.02;
          }
        }
      }

      draw() {
        ctx.beginPath();
        // Pulsing glow for nodes
        const pulse = Math.sin(Date.now() * 0.002 + this.pulseSeed) * 0.5 + 1;
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.fill();
      }
    }

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // DNA double helix variables
    let dnaAngle = 0;

    function drawDNA() {
      // Position DNA helix on the right side of the screen
      const dnaX = width * 0.85;
      const dnaYStart = height * 0.15;
      const dnaYEnd = height * 0.85;
      const dnaWidth = 40;
      const dnaSpeed = 0.005;
      const nodeSpacing = 24;

      dnaAngle += dnaSpeed;

      for (let y = dnaYStart; y < dnaYEnd; y += nodeSpacing) {
        const offset = (y * 0.01) + dnaAngle;
        const x1 = dnaX + Math.sin(offset) * dnaWidth;
        const x2 = dnaX - Math.sin(offset) * dnaWidth;

        // Draw connecting link
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw node 1
        ctx.beginPath();
        ctx.arc(x1, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.fill();

        // Draw node 2
        ctx.beginPath();
        ctx.arc(x2, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
        ctx.fill();
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw particle network connections
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      drawDNA();
      requestAnimationFrame(animate);
    }

    animate();
  }

  function initTrendChart() {
    const canvas = document.getElementById('healthTrendChart');
    if (!canvas) return;

    if (typeof Chart !== 'undefined') {
      new Chart(canvas, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Health Index',
            data: [720, 742, 735, 758, 770, 765, 782],
            borderColor: '#0284c7',
            borderWidth: 3,
            backgroundColor: 'rgba(2, 132, 199, 0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#0284c7',
            pointBorderColor: '#ffffff',
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#18181b', font: { weight: 'bold', size: 11 } }
            },
            y: {
              grid: { color: 'rgba(0, 0, 0, 0.08)' },
              ticks: { color: '#18181b', font: { weight: 'bold', size: 11 } },
              min: 300,
              max: 900
            }
          }
        }
      });
      return;
    }

    // Native HTML5 Canvas Fallback if Chart.js is not loaded
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth || 300;
    const height = canvas.clientHeight || 160;
    canvas.width = width;
    canvas.height = height;

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [720, 742, 735, 758, 770, 765, 782];
    const minVal = 650;
    const maxVal = 850;

    const padding = 30;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    // Draw horizontal grid lines & labels
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#18181b';
    ctx.font = 'bold 11px sans-serif';

    [650, 750, 850].forEach(val => {
      const y = padding + graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.fillText(val, 4, y + 4);
    });

    // Plot data points
    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * graphWidth;
      const y = padding + graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;
      return { x, y, val, label: labels[idx] };
    });

    // Draw fill area
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.lineTo(points[0].x, height - padding);
    ctx.closePath();
    ctx.fillStyle = 'rgba(2, 132, 199, 0.1)';
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw points & x labels
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#18181b';
      ctx.fillText(p.label, p.x - 10, height - 6);
    });
  }

  // Testimonial shift helper
  let currentTestimonialIndex = 0;
  const testimonials = [
    {
      stars: '★★★★★',
      text: '"Veda AI diagnosed my Vata sleep imbalance with incredible accuracy. Linking to organic Ayurvedic remedies restored my circadian pattern within weeks!"',
      author: 'Rahul Dev',
      badge: 'Verified',
      score: 'Vedic Score: 812 • Mumbai'
    },
    {
      stars: '★★★★★',
      text: '"Integrating allopathic consultations with custom botanical formulations helped stabilize my blood glucose profile under direct clinical supervision."',
      author: 'Dr. Anita Desai',
      badge: 'Medical Advisor',
      score: 'MBBS, MD • Bangalore'
    },
    {
      stars: '★★★★★',
      text: '"The automated diabetic retinopathy grading system ran a deep computer vision scan on my retinal fundus scan and grade matched Aravind hospital results!"',
      author: 'Srinivas Murthy',
      badge: 'Verified Patient',
      score: 'Score: 792 • Chennai'
    }
  ];

  window.shiftTestimonial = function(dir) {
    currentTestimonialIndex = (currentTestimonialIndex + dir + testimonials.length) % testimonials.length;
    const data = testimonials[currentTestimonialIndex];
    const container = document.getElementById('testimonialCarousel');
    if (!container) return;

    container.innerHTML = `
      <div class="glass-panel" style="flex: 0 0 100%; padding: 40px; box-sizing:border-box; text-align:center; animation: fadeIn 0.4s ease-out;">
        <div style="font-size: 24px; color: var(--neon-cyan); margin-bottom: 20px;">${data.stars}</div>
        <p style="font-size: 16px; color: white; line-height: 1.6; font-style: italic; margin-bottom: 24px;">
          ${data.text}
        </p>
        <div style="display:flex; justify-content:center; align-items:center; gap:16px;">
          <div style="width:50px; height:50px; border-radius:50%; background: #1e293b; display:flex; align-items:center; justify-content:center; font-size:24px;">👤</div>
          <div style="text-align:left;">
            <div style="font-weight:700; color:white; font-size:15px;">${data.author} <span style="color:var(--neon-teal); font-size:11px; margin-left:4px;">✓ ${data.badge}</span></div>
            <div style="font-size:12px; color:var(--gray-500);">${data.score}</div>
          </div>
        </div>
      </div>
    `;
  };

  // FAQ Accordion helper
  window.toggleFaq = function(header) {
    const parent = header.parentElement;
    const content = parent.querySelector('.accordion-content');
    const span = header.querySelector('span');

    if (content.style.maxHeight) {
      content.style.maxHeight = null;
      span.textContent = '+';
      header.classList.remove('active');
    } else {
      // Close all other open content
      document.querySelectorAll('.accordion-content').forEach(item => {
        item.style.maxHeight = null;
        const h = item.parentElement.querySelector('.accordion-header');
        if (h) {
          h.classList.remove('active');
          const s = h.querySelector('span');
          if (s) s.textContent = '+';
        }
      });
      content.style.maxHeight = content.scrollHeight + 'px';
      span.textContent = '-';
      header.classList.add('active');
    }
  };

  // Home Page High-Fidelity Health Intelligence Chat Engine
  function addHomeChatMessage(content, type = 'bot', metadata = null) {
    const chatContainer = document.getElementById('homeChatContainer');
    if (!chatContainer) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${type}-msg`;
    msgDiv.style.display = 'flex';
    msgDiv.style.flexDirection = 'column';
    msgDiv.style.alignItems = type === 'user' ? 'flex-end' : 'flex-start';
    msgDiv.style.marginBottom = '16px';
    msgDiv.style.animation = 'slideUp 0.3s ease-out';

    if (metadata && metadata.id) {
      msgDiv.id = metadata.id;
    }

    if (metadata && metadata.isResultCard) {
      msgDiv.appendChild(createHomeResultCard(metadata.data));
    } else {
      const bubble = document.createElement('div');
      bubble.className = `msg-bubble ${type}-bubble`;
      bubble.style.maxWidth = '80%';
      bubble.style.padding = '12px 18px';
      bubble.style.borderRadius = '16px';
      bubble.style.fontSize = '14px';
      bubble.style.lineHeight = '1.6';
      if (type === 'user') {
        bubble.style.background = 'var(--neon-blue)';
        bubble.style.color = 'white';
        bubble.style.borderBottomRightRadius = '4px';
      } else {
        bubble.style.background = 'rgba(255, 255, 255, 0.04)';
        bubble.style.border = '1px solid rgba(255,255,255,0.08)';
        bubble.style.color = 'var(--gray-300)';
        bubble.style.borderBottomLeftRadius = '4px';
      }
      bubble.innerHTML = content;
      msgDiv.appendChild(bubble);
    }

    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function createHomeResultCard(data) {
    const card = document.createElement('div');
    card.className = 'result-card glass-panel';
    card.style.width = '100%';
    card.style.background = 'rgba(15, 23, 42, 0.6)';
    card.style.border = '1px solid rgba(255,255,255,0.08)';
    card.style.borderRadius = '20px';
    card.style.overflow = 'hidden';
    card.style.marginTop = '10px';
    card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
    
    const cardId = 'home_card_' + Date.now();
    
    card.innerHTML = `
      <div style="padding: 16px 20px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 16px; font-weight: 800; color: white;">${data.condition}</div>
          <div style="font-size: 11px; color: var(--gray-500); margin-top: 2px;">Verified Health Intelligence Report</div>
        </div>
        <div style="font-size: 20px;">🏢</div>
      </div>
      
      <div style="padding: 20px 20px 0; font-size: 13px; color: var(--gray-300); line-height: 1.6;">
        <span style="font-size: 9px; font-weight: 800; color: var(--neon-blue); letter-spacing: 1px; display: block; margin-bottom: 6px;">CONDITION OVERVIEW</span>
        ${data.description}
      </div>

      <div style="display: flex; background: rgba(0,0,0,0.2); padding: 4px; margin: 16px 20px; border-radius: 10px; gap: 4px;">
        <button class="tab-btn active" style="flex: 1; padding: 8px; border: none; background: rgba(255,255,255,0.08); color: white; font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer;" onclick="switchHomeTab(this, 'modern', '${cardId}')">Modern Medicine</button>
        <button class="tab-btn" style="flex: 1; padding: 8px; border: none; background: transparent; color: var(--gray-400); font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer;" onclick="switchHomeTab(this, 'ayurvedic', '${cardId}')">Ayurvedic</button>
        <button class="tab-btn" style="flex: 1; padding: 8px; border: none; background: transparent; color: var(--gray-400); font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer;" onclick="switchHomeTab(this, 'home', '${cardId}')">Home Remedies</button>
      </div>

      <div id="${cardId}_modern" class="tab-content active" style="padding: 0 20px 20px; display: block;">
        ${data.modern.map(m => `
          <div style="margin-bottom: 16px;">
            <h3 style="color:white; font-size: 14px; margin-bottom: 8px; display:flex; align-items:center; gap:8px;">
              ${m.name} 
              <span style="color: var(--neon-amber); border: 1px solid var(--neon-amber); padding: 1px 6px; border-radius: 3px; font-size: 9px; font-weight: 800;">PHARMA GRADE</span>
            </h3>
            <div style="font-size: 9px; font-weight: 800; color: var(--neon-blue); letter-spacing: 1px; margin-bottom: 4px;">PRIMARY USE & MECHANISM</div>
            <div style="font-size: 12px; color: #cbd5e1; line-height: 1.5; margin-bottom: 12px;">${m.primary_use} <br><strong>Action:</strong> ${m.mechanism}</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
              <div style="padding: 10px; background: rgba(0,0,0,0.15); border-radius: 8px; border: 1px solid rgba(255,255,255,0.03);">
                <div style="font-size: 9px; color: #94a3b8; font-weight: 800;">COMMON</div>
                <div style="font-size: 11px; color: white; margin-top: 2px;">${m.side_effects.common.join(', ')}</div>
              </div>
              <div style="padding: 10px; background: rgba(0,0,0,0.15); border-radius: 8px; border: 1px solid rgba(255,255,255,0.03);">
                <div style="font-size: 9px; color: #f87171; font-weight: 800;">RARE / ADVERSE</div>
                <div style="font-size: 11px; color: white; margin-top: 2px;">${m.side_effects.rare.join(', ')}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div id="${cardId}_ayurvedic" class="tab-content" style="padding: 0 20px 20px; display: none;">
        ${data.ayurvedic.map(a => `
          <div style="margin-bottom: 16px;">
            <h3 style="color:var(--neon-green); font-size: 14px; margin-bottom: 8px;">${a.name}</h3>
            <div style="font-size: 9px; font-weight: 800; color: var(--neon-blue); letter-spacing: 1px; margin-bottom: 4px;">TRADITIONAL USE</div>
            <div style="font-size: 12px; color: #cbd5e1; line-height: 1.5; margin-bottom: 12px;">${a.traditional_use} <br><strong>Concept:</strong> ${a.foundation}</div>
            
            <div style="font-size: 9px; font-weight: 800; color: var(--neon-blue); letter-spacing: 1px; margin-bottom: 6px;">COMPOSITION</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${a.ingredients.slice(0, 2).map(ing => `
                <div style="background:rgba(16,185,129,0.05); padding:8px; border-radius:8px; border:1px solid rgba(16,185,129,0.08); font-size:11px;">
                  <strong>${ing.common_name}</strong> <span style="opacity:0.7;">(${ing.botanical_name})</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div id="${cardId}_home" class="tab-content" style="padding: 0 20px 20px; display: none;">
        ${data.home_remedies.map(h => `
          <div style="margin-bottom: 16px;">
            <h3 style="color:var(--neon-amber); font-size: 14px; margin-bottom: 8px;">${h.name}</h3>
            <div style="font-size: 12px; color: #cbd5e1; line-height: 1.5; margin-bottom: 8px;"><em>"${h.context}"</em></div>
            <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:8px; font-size:11px; color:#94a3b8;">
              ${h.instructions.method}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div style="padding: 12px; background: rgba(0,0,0,0.15); text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
        <button onclick="window.printMedicalReport('${data.key}')" style="background:transparent; border:none; color:var(--neon-blue); font-size:11px; font-weight:800; cursor:pointer; text-transform:uppercase; letter-spacing:1px;">Download Clinical Report ↓</button>
      </div>
    `;
    return card;
  }

  function switchHomeTab(btn, tabType, cardId) {
    const card = btn.closest('.result-card');
    card.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
      b.style.background = 'transparent';
      b.style.color = 'var(--gray-400)';
    });
    btn.classList.add('active');
    btn.style.background = 'rgba(255,255,255,0.1)';
    btn.style.color = 'white';

    card.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(`${cardId}_${tabType}`).style.display = 'block';
  }

  async function handleHomeChatMessage() {
    const input = document.getElementById('homeChatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addHomeChatMessage(text, 'user');

    const scanner = document.getElementById('homeScanner');
    if (scanner) scanner.style.display = 'block';

    const typingId = 'home_typing_' + Date.now();
    addHomeChatMessage('<div style="font-size: 11px; font-weight: 800; color: var(--neon-blue); text-transform: uppercase; letter-spacing: 1px; margin:0;">Clinical Intelligence Engine Analyzing...</div><div style="display:flex; gap:8px; margin-top:8px;"><span class="dot">●</span><span class="dot" style="animation-delay:0.2s">●</span><span class="dot" style="animation-delay:0.4s">●</span></div>', 'bot', { id: typingId });

    setTimeout(() => {
      if (scanner) scanner.style.display = 'none';
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.closest('.chat-msg').remove();
      processHomeQuery(text);
    }, 1800);
  }

  function processHomeQuery(query) {
    const q = query.toLowerCase();
    let foundKey = null;

    const synonyms = {
      "chicken pox": ["pox", "rash", "blisters", "varicella", "skin rashes"],
      "diabetes": ["sugar", "glucose", "hyperglycemia", "insulin"],
      "blood pressure": ["hypertension", "bp", "heart pressure", "high bp", "pressure"],
      "influenza": ["flu", "viral fever", "chills", "tamiflu", "high fever", "high body temperature"],
      "common cold": ["cold", "sneezing", "congestion", "runny nose", "rhinorrhoea"],
      "dengue": ["mosquito fever", "platelet", "dangu", "joint pain", "eye redness"],
      "measles": ["rubeola", "red spots", "mumps"],
      "fever": ["high body temperature", "sweating", "perspiration", "dehydration", "pyrexia", "high fever"],
      "cough": ["dry cough", "wet cough", "chest congestion", "coughing"],
      "abdominal pain": ["stomach pain", "stomach ache", "belly pain", "loss of appetite", "nausea", "vomiting", "stomuch pain"],
      "headache": ["migraine", "head pain", "tension", "cephalalgia"],
      "sore throat": ["throat pain", "painful tonsils", "swallowing pain", "pharyngitis", "tonsillitis"],
      "back pain": ["lumbago", "spine pain", "lumbar", "back ache"],
      "diarrhea": ["loose motion", "watery stools", "atisara", "diarrhoea"],
      "nausea": ["vomiting", "urge to vomit", "emesis", "nausea and vomiting"]
    };

    const kb = window.MEDICAL_KB || {};
    for (const key in kb) {
      const matchKeywords = [key, ... (synonyms[key] || [])];
      if (matchKeywords.some(k => q.includes(k)) || key.split(' ').every(word => q.includes(word))) {
        foundKey = key;
        break;
      }
    }

    if (foundKey) {
      const data = kb[foundKey];
      data.key = foundKey;
      addHomeChatMessage(`As a healthcare professional, I've analyzed your query regarding **${data.condition}**. <br><br>Generating a comprehensive clinical report based on the latest integrative guidelines...`, 'bot');
      
      setTimeout(() => {
        addHomeChatMessage('', 'bot', { isResultCard: true, data: data });
        
        setTimeout(() => {
          addHomeChatMessage("Based on your interest in " + data.condition + ", would you like to discuss specific dosage guidelines or potential interactions with other medications you might be taking?", 'bot');
        }, 1500);
      }, 800);
    } else {
      addHomeChatMessage("I'm trained as a medical expert, and I understand you're inquiring about specific symptoms. While I'm currently expanding my high-fidelity condition database, I can provide general advice or connect you with a verified practitioner.", 'bot');
      addHomeChatMessage("Try asking about **'Chicken Pox symptoms'**, **'Sugar levels'**, or **'High BP'** for a full clinical breakdown.", 'bot');
    }
  }

  function homeQuickAsk(text) {
    const input = document.getElementById('homeChatInput');
    if (input) {
      input.value = text;
      handleHomeChatMessage();
    }
  }

  // Speech helper
  function startHomeSpeech() {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.start();
    
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      const input = document.getElementById('homeChatInput');
      if (input) {
        input.value = transcript;
        handleHomeChatMessage();
      }
    };
  }

  // Bind to window explicitly for HTML onClick events
  window.addHomeChatMessage = addHomeChatMessage;
  window.handleHomeChatMessage = handleHomeChatMessage;
  window.homeQuickAsk = homeQuickAsk;
  window.startHomeSpeech = startHomeSpeech;
  window.switchHomeTab = switchHomeTab;
})();
