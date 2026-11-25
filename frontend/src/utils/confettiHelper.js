import confetti from 'canvas-confetti';

/**
 * SkillSwap Whimsical Pastel 3D Confetti Cannons
 * Fires celebratory particles using the exact SkillSwap color palette:
 * Lavender (#C8B6F6), Butter Yellow (#F5DE91), Sage Green (#B9CBB3),
 * Dusty Purple (#8270B5), Warm Charcoal (#34313B).
 */

const PALETTE = ['#C8B6F6', '#F5DE91', '#B9CBB3', '#8270B5', '#FAF7F0', '#34313B'];

export function fireSkillSwapConfetti(origin = { x: 0.5, y: 0.6 }) {
  // Center burst
  confetti({
    particleCount: 50,
    spread: 70,
    origin,
    colors: PALETTE,
    scalar: 1.1,
    shapes: ['circle', 'square'],
    ticks: 200,
    gravity: 0.8,
    drift: 0.1,
  });

  // Delayed side flutter
  setTimeout(() => {
    confetti({
      particleCount: 25,
      angle: 60,
      spread: 55,
      origin: { x: Math.max(0.1, origin.x - 0.2), y: origin.y },
      colors: PALETTE,
      scalar: 0.9,
    });
    confetti({
      particleCount: 25,
      angle: 120,
      spread: 55,
      origin: { x: Math.min(0.9, origin.x + 0.2), y: origin.y },
      colors: PALETTE,
      scalar: 0.9,
    });
  }, 150);
}

export function fireSchoolPrideFireworks() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 40 * (timeLeft / duration);

    confetti({
      particleCount,
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors: PALETTE,
    });
  }, 250);
}
