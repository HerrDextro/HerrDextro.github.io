const canvas = document.getElementById("matrixCanvas");
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
      // feedback effect (slight black overlay)
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#0F0";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        let text = charArray[Math.floor(Math.random() * charArray.length)];
        let x = i * fontSize;
        let y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        // reset drop randomly
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    }

    setInterval(draw, 80); 

//easy redirections //call by onclick="navigateToTopic('STALKERinfos')
function navigateToTopic(topic) {
  window.location.href = topic + '.html'; // Adjust this to the actual topic page URL
}