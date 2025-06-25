//changed the thing with the DOMContentloaded to "modularly" avoid the background in paged I dont want it

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("matrixCanvas");
  if (!canvas) return; // No canvas -> Exit early — no background!

  const ctx = canvas.getContext("2d");

  let width, height, cols, rows;
  let fontSize = 12;
  let charArray = "しとせへんくこひ1234567890|-_abedgf".split("");

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    cols = Math.floor(width / fontSize);
    rows = Math.floor(height / fontSize);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  let drops = Array(cols).fill(0);

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#0F0";
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      let text = charArray[Math.floor(Math.random() * charArray.length)];
      let x = i * fontSize;
      let y = drops[i] * fontSize;

      ctx.fillText(text, x, y);

      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    }
  }

  setInterval(draw, 80);
});


//easy redirections //call by onclick="navigateToTopic('STALKERinfos')
function navigateToTopic(topic) {
  window.location.href = topic + '.html'; // Adjust this to the actual topic page URL
}

//menu button functions
  function toggleMenu() {
    const menu = document.getElementById('dropdownMenu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
  }

  // Optional: Close the menu if clicking elsewhere
  document.addEventListener('click', function(event) {
    const isMenu = event.target.closest('.menu-container');
    if (!isMenu) {
      document.getElementById('dropdownMenu').style.display = 'none';
    }
  });

//for searchbar
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector('.search input');
  const searchableItems = document.querySelectorAll('.searchable');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();

      searchableItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }
});

//WebLLM integration (all gpt tho lol)
let chatEngine;

async function initWebLLM() {
  
  const modelName = "Qwen1.5-0.5B-chat-q4f32_1";

  const chatEngine = await webllm.createChatModule(); // note the lowercase 'c'
  //chatEngine = await webllm.CreateChatModule();
  await chatEngine.reload(modelName);
  console.log("WebLLM ready.");
}

async function sendMessage() {
  const input = document.getElementById("userInput").value;
  const output = document.getElementById("chatOutput");

  if (!chatEngine) {
    output.innerHTML += `<p><strong>System:</strong> LLM not ready yet.</p>`;
    return;
  }

  const reply = await chatEngine.chat(input);
  output.innerHTML += `<p><strong>You:</strong> ${input}</p>`;
  output.innerHTML += `<p><strong>LLM:</strong> ${reply}</p>`;
  document.getElementById("userInput").value = "";
}

window.addEventListener("DOMContentLoaded", initWebLLM);
