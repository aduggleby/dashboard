export function initializeReorder(): void {
  const grid = document.getElementById("cards-grid");
  if (!grid) {
    return;
  }

  const antiForgery = document.querySelector<HTMLInputElement>("#reorder-anti-forgery input[name='__RequestVerificationToken']");
  let dragSource: HTMLElement | null = null;
  const dropPreview = document.createElement("div");
  dropPreview.className = "card-drop-preview";

  const cards = (): HTMLElement[] => [...grid.querySelectorAll<HTMLElement>("[data-card-id]")];
  const cardIds = (): number[] => cards().map((x) => Number.parseInt(x.getAttribute("data-card-id") ?? "", 10));

  const saveOrder = async (): Promise<void> => {
    const response = await fetch("/cards/reorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        RequestVerificationToken: antiForgery?.value ?? ""
      },
      body: JSON.stringify({ cardIds: cardIds() })
    });

    if (!response.ok) {
      window.location.reload();
    }
  };

  const moveCard = async (card: HTMLElement, direction: "up" | "down"): Promise<void> => {
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
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-card-id]");
    if (!target || !event.dataTransfer) {
      return;
    }

    dragSource = target;
    dragSource.classList.add("card--dragging");
    event.dataTransfer.effectAllowed = "move";
  });

  grid.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    if (!dragSource) {
      return;
    }

    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-card-id]");
    if (!target) {
      if (grid.lastElementChild !== dropPreview) {
        grid.appendChild(dropPreview);
      }
      return;
    }

    if (target === dragSource) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const beforeTarget = event.clientY < rect.top + rect.height / 2;
    const desiredPosition = beforeTarget ? target : target.nextSibling;

    if (desiredPosition !== dropPreview) {
      grid.insertBefore(dropPreview, desiredPosition);
    }
  });

  grid.addEventListener("drop", async (event) => {
    event.preventDefault();
    if (!dragSource) {
      return;
    }

    if (dropPreview.parentElement === grid) {
      grid.insertBefore(dragSource, dropPreview);
      dropPreview.remove();
    }

    await saveOrder();
  });

  grid.addEventListener("dragend", () => {
    if (dragSource) {
      dragSource.classList.remove("card--dragging");
    }
    dragSource = null;
    dropPreview.remove();
  });

  grid.querySelectorAll<HTMLElement>("[data-move]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const current = event.currentTarget as HTMLElement;
      const dir = current.getAttribute("data-move");
      const card = current.closest<HTMLElement>("[data-card-id]");
      if (!card || (dir !== "up" && dir !== "down")) {
        return;
      }

      await moveCard(card, dir);
    });
  });

  grid.querySelectorAll<HTMLElement>("[data-card-id]").forEach((card) => {
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
}
