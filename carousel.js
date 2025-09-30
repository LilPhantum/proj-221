document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('cardTrack');
  const scrollAmount = track.offsetWidth; // scroll by visible width

  document.querySelector('.arrow.left').addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  document.querySelector('.arrow.right').addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
});


