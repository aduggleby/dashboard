(() => {
  const grid = document.getElementById("cards-grid");
  if (!grid) {
    return;
  }

  const antiForgery = document.querySelector("#reorder-anti-forgery input[name='__RequestVerificationToken']");
  let dragSource = null;

  const cards = () => [...grid.querySelectorAll("[data-card-id]")];
  const cardIds = () => cards().map((x) => Number.parseInt(x.getAttribute("data-card-id"), 10));

  const saveOrder = async () => {
    const response = await fetch("/cards/reorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "RequestVerificationToken": antiForgery?.value || ""
      },
      body: JSON.stringify({ cardIds: cardIds() })
    });

    if (!response.ok) {
      window.location.reload();
    }
  };

  const moveCard = async (card, direction) => {
    const list = cards();
    const currentIndex = list.indexOf(card);
    if (currentIndex < 0) {
      return;
    }

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= list.length) {
      return;
    }

    const target = list[swapIndex];
    if (direction === "up") {
      grid.insertBefore(card, target);
    } else {
      grid.insertBefore(target, card);
    }

    await saveOrder();
    card.focus();
  };

  grid.addEventListener("dragstart", (event) => {
    const target = event.target.closest("[data-card-id]");
    if (!target) {
      return;
    }

    dragSource = target;
    event.dataTransfer.effectAllowed = "move";
  });

  grid.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });

  grid.addEventListener("drop", async (event) => {
    event.preventDefault();
    const target = event.target.closest("[data-card-id]");
    if (!dragSource || !target || dragSource === target) {
      return;
    }

    const sourceIndex = cards().indexOf(dragSource);
    const targetIndex = cards().indexOf(target);
    if (sourceIndex < targetIndex) {
      grid.insertBefore(dragSource, target.nextSibling);
    } else {
      grid.insertBefore(dragSource, target);
    }

    await saveOrder();
  });

  grid.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const dir = event.currentTarget.getAttribute("data-move");
      const card = event.currentTarget.closest("[data-card-id]");
      if (!card || (dir !== "up" && dir !== "down")) {
        return;
      }

      await moveCard(card, dir);
    });
  });

  grid.querySelectorAll("[data-card-id]").forEach((card) => {
    card.addEventListener("keydown", async (event) => {
      if (event.altKey && event.key === "ArrowUp") {
        event.preventDefault();
        await moveCard(card, "up");
      }

      if (event.altKey && event.key === "ArrowDown") {
        event.preventDefault();
        await moveCard(card, "down");
      }
    });
  });
})();
