export function initQuotations() {
  if (!localStorage.getItem("quotations")) {
    localStorage.setItem(
      "quotations",
      JSON.stringify([
        {
          id: 1,
          name: "Nazaby",
          amount: 50,
          issueDate: "2025-12-25",
          items: [
            { id: 1, name: "Product A", qty: 2, unitPrice: 10, total: 20 },
            { id: 2, name: "Product B", qty: 3, unitPrice: 10, total: 30 },
          ],
        },
      ])
    );
  }
}
