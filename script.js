let notes = JSON.parse(localStorage.getItem("notes")) || [];
let activeId = null;

const notesList = document.getElementById("notesList");
const editor = document.getElementById("editor");
const titleInput = document.getElementById("title");
const search = document.getElementById("search");
const status = document.getElementById("status");

function save() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function render(filter = "") {
  notesList.innerHTML = "";

  notes
    .filter(n =>
      n.title.toLowerCase().includes(filter.toLowerCase()) ||
      n.content.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => b.pinned - a.pinned)
    .forEach(note => {
      const div = document.createElement("div");
      div.className = "note";

      div.innerHTML = `
        <div class="note-title">${note.pinned ? "📌 " : ""}${note.title}</div>
        <div class="note-preview">${note.content.substring(0, 40)}</div>
        <div style="margin-top:5px;">
          <button onclick="pinNote(${note.id})">📌</button>
          <button onclick="deleteNote(${note.id})">🗑️</button>
        </div>
      `;

      div.onclick = (e) => {
        if (e.target.tagName === "BUTTON") return;

        activeId = note.id;
        editor.value = note.content;
        titleInput.value = note.title;
      };

      notesList.appendChild(div);
    });
}

function createNote() {
  const newNote = {
    id: Date.now(),
    title: "Nova nota",
    content: "",
    pinned: false
  };

  notes.unshift(newNote);
  activeId = newNote.id;

  titleInput.value = newNote.title;
  editor.value = "";

  save();
  render();
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);

  if (activeId === id) {
    activeId = null;
    editor.value = "";
    titleInput.value = "";
  }

  save();
  render();
}

function pinNote(id) {
  notes = notes.map(n =>
    n.id === id ? { ...n, pinned: !n.pinned } : n
  );

  save();
  render(search.value);
}

function updateNote() {
  notes = notes.map(n =>
    n.id === activeId
      ? { ...n, title: titleInput.value, content: editor.value }
      : n
  );

  save();
  render(search.value);
}

// 💾 SALVAR MANUAL
function saveCurrentNote() {
  if (!activeId) return;

  updateNote();
  status.innerText = "✔ Salvo";

  setTimeout(() => (status.innerText = ""), 1500);
}

// 🧠 AUTO SAVE
let timeout;

function autoSave() {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    updateNote();
    status.innerText = "✔ Auto-salvo";

    setTimeout(() => (status.innerText = ""), 1500);
  }, 800);
}

function exportNotes() {
  const text = notes.map(n => `${n.title}\n${n.content}\n\n`).join("");

  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "devnotes.txt";
  a.click();
}

editor.addEventListener("input", autoSave);
titleInput.addEventListener("input", autoSave);

search.addEventListener("input", () => {
  render(search.value);
});

function toggleTheme() {
  document.body.classList.toggle("light");
}

render();