(() => {
  const input = document.querySelector("#labSearch");
  const cards = [...document.querySelectorAll(".lab-card")];
  const empty = document.querySelector("#emptyState");
  if (!input || !cards.length || !empty) return;

  const filter = () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const searchable = `${card.textContent} ${card.dataset.search || ""}`.toLowerCase();
      card.hidden = Boolean(query) && !searchable.includes(query);
      if (!card.hidden) visible += 1;
    });
    empty.hidden = visible !== 0;
  };

  input.addEventListener("input", filter);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
    event.preventDefault();
    input.focus();
  });
})();
