document.addEventListener("DOMContentLoaded", () => {
  const slide = document.querySelector(".slide");

  //movimiento del raton
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    slide.style.transform = `rotateX(${-y * 5}deg) rotateY(${
      x * 5
    }deg) scale(1.05)`;
  });
});
