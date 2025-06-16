// --- JAVASCRIPT: js/app.js (Complete, Final Version with All Fixes) ---

// --- GLOBAL VARIABLES ---
let state = {
    notes: [],
    activeNoteId: null,
    theme: 'light',
    sidebarCollapsed: false,
};
let quill;
let turndownService;
let searchIndex;
let isEditorUpdateFromLoad = false;

// --- DOM ELEMENTS ---
let noteList, newNoteBtn, editorContainer, noteTitleInput, previewCode, themeToggleBtn,
    sidebar, toggleSidebarBtn, searchInput, importBtn, exportBtn, importFileInput,
    favoriteBtn, exportNotePdfBtn, deleteNoteBtn, editorPanel;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    noteList = document.getElementById('note-list');
    newNoteBtn = document.getElementById('new-note-btn');
    editorContainer = document.getElementById('editor-container');
    noteTitleInput = document.getElementById('note-title-input');
    previewCode = document.getElementById('preview-code');
    themeToggleBtn = document.getElementById('theme-toggle-btn');
    sidebar = document.getElementById('sidebar');
    toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    searchInput = document.getElementById('search-input');
    importBtn = document.getElementById('import-btn');
    exportBtn = document.getElementById('export-btn');
    importFileInput = document.getElementById('import-file-input');
    favoriteBtn = document.getElementById('favorite-btn');
    exportNotePdfBtn = document.getElementById('export-note-pdf');
    deleteNoteBtn = document.getElementById('delete-note-btn');
    editorPanel = document.querySelector('.editor-panel');

    initializeEditor();
    loadState();

    if(state.sidebarCollapsed) {
        document.body.classList.add('sidebar-collapsed');
        toggleSidebarBtn.querySelector('i').className = 'fas fa-chevron-right';
    } else {
        toggleSidebarBtn.querySelector('i').className = 'fas fa-chevron-left';
    }

    renderNoteList();
    loadActiveNote();
    setupEventListeners();
    updateTheme(state.theme);
    buildSearchIndex();
});

// --- EDITOR LOGIC ---
function initializeEditor() {
    turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    quill = new Quill('#editor-container', {
        theme: 'snow',
        modules: { toolbar: [[{ 'header': [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], ['blockquote', 'code-block'], [{ 'list': 'ordered' }, { 'list': 'bullet' }], ['link', 'image'], ['clean']] }
    });
    quill.on('text-change', (delta, oldDelta, source) => { if (source === 'user') handleEditorUpdate(); });
}

function handleEditorUpdate() {
    if (isEditorUpdateFromLoad || !state.activeNoteId) return;
    const htmlContent = quill.root.innerHTML;
    const markdownContent = turndownService.turndown(htmlContent);
    previewCode.textContent = markdownContent;
    hljs.highlightElement(previewCode);
    const activeNote = findNoteById(state.activeNoteId);
    if (activeNote && activeNote.content !== markdownContent) {
        activeNote.content = markdownContent;
        activeNote.updatedAt = Date.now();
        clearTimeout(window.saveTimeout);
        window.saveTimeout = setTimeout(() => {
            saveState();
            updateNoteInList(state.activeNoteId);
            buildSearchIndex();
        }, 500);
    }
}

// --- DATA & STATE FUNCTIONS ---
function loadState() {
    const savedState = JSON.parse(localStorage.getItem('markdown-notes-app'));
    if (savedState) {
        state = { ...state, ...savedState };
    }
}
function saveState() { localStorage.setItem('markdown-notes-app', JSON.stringify(state)); }
function findNoteById(id) { return state.notes.find(note => note.id === id); }


// --- NOTE ACTIONS ---

// FIX: Simplified createNewNote to prevent race conditions.
function createNewNote() {
    // 1. Cancel any pending save from the note we are leaving.
    clearTimeout(window.saveTimeout);

    // 2. Create the new note object in memory.
    const newNote = { id: `note-${Date.now()}`, title: 'Untitled Note', content: '# New Note\n\nStart writing!', createdAt: Date.now(), updatedAt: Date.now(), favorite: false, };

    // 3. Update the state.
    state.notes.unshift(newNote);
    state.activeNoteId = newNote.id;
    saveState();
    
    // 4. Re-render the sidebar list.
    renderNoteList();

    // 5. Explicitly load the new note into the editor. This is the key.
    loadActiveNote();

    // 6. Update the search index.
    buildSearchIndex();
}

function deleteActiveNote() {
    if (!state.activeNoteId) return;
    const noteToDelete = findNoteById(state.activeNoteId);
    if (confirm(`Are you sure you want to delete "${noteToDelete.title}"?`)) {
        clearTimeout(window.saveTimeout);
        state.notes = state.notes.filter(note => note.id !== state.activeNoteId);
        state.activeNoteId = null;
        saveState();
        renderNoteList();
        loadActiveNote();
        buildSearchIndex();
    }
}

// FIX: This function is now the single source of truth for putting content in the editor.
function loadActiveNote() {
    // Cancel any pending save from the note we are leaving.
    clearTimeout(window.saveTimeout);

    // Find which note to load. If no note is active, load the first one.
    if (!state.activeNoteId && state.notes.length > 0) {
        state.activeNoteId = state.notes[0].id;
    }

    const note = findNoteById(state.activeNoteId);

    // If a note is found, load it.
    if (note) {
        isEditorUpdateFromLoad = true;
        noteTitleInput.value = note.title;
        const html = marked.parse(note.content || '');
        quill.setContents([]); // Clear the editor completely first
        quill.clipboard.dangerouslyPasteHTML(0, html);
        quill.setSelection(quill.getLength(), 0);
        previewCode.textContent = note.content;
        hljs.highlightElement(previewCode);
        isEditorUpdateFromLoad = false;
    } else {
        // If no note is found (e.g., the last note was deleted), clear the editor.
        clearEditor();
    }
    // Update the active state in the UI.
    updateActiveNoteInList(state.activeNoteId);
}

function clearEditor() {
    noteTitleInput.value = "";
    noteTitleInput.placeholder = "Select or create a note";
    isEditorUpdateFromLoad = true;
    quill.setText('');
    isEditorUpdateFromLoad = false;
    previewCode.textContent = '';
}

// --- UI RENDERING ---
function renderNoteList(notesToRender = state.notes) {
    noteList.innerHTML = '';
    notesToRender.sort((a, b) => b.updatedAt - a.updatedAt).forEach(note => {
        const item = document.createElement('div');
        item.className = 'note-item';
        item.dataset.id = note.id;
        item.innerHTML = `<h4 class="note-item-title">${note.title}</h4><p class="note-item-date">${new Date(note.updatedAt).toLocaleString()}</p>`;
        item.addEventListener('click', () => {
            if(state.activeNoteId !== note.id) {
                state.activeNoteId = note.id;
                // Clicking a note in the list just calls loadActiveNote.
                loadActiveNote();
            }
        });
        noteList.appendChild(item);
    });
    updateActiveNoteInList(state.activeNoteId);
}

function updateActiveNoteInList(activeId) {
    document.querySelectorAll('.note-item').forEach(item => item.classList.toggle('active', item.dataset.id === activeId));
    const isDisabled = !activeId;
    editorPanel.classList.toggle('disabled', isDisabled);
    noteTitleInput.disabled = isDisabled;
    deleteNoteBtn.disabled = isDisabled;
    exportNotePdfBtn.disabled = isDisabled;
    favoriteBtn.disabled = isDisabled;
    quill.enable(!isDisabled);
}

function updateNoteInList(noteId) {
    const note = findNoteById(noteId);
    const item = noteList.querySelector(`.note-item[data-id="${noteId}"]`);
    if (item && note) {
        item.querySelector('.note-item-title').textContent = note.title;
        item.querySelector('.note-item-date').textContent = new Date(note.updatedAt).toLocaleString();
    }
}

// --- THEMING ---
function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
    state.theme = newTheme;
    saveState();
}
function updateTheme(theme) {
    document.body.className = `${theme}-mode`;
    if (state.sidebarCollapsed) {
        document.body.classList.add('sidebar-collapsed');
    }
    document.getElementById('theme-link').href = `css/themes/${theme}.css`;
    document.getElementById('hljs-theme-light').disabled = (theme === 'dark');
    document.getElementById('hljs-theme-dark').disabled = (theme === 'light');
    themeToggleBtn.querySelector('i').className = `fas ${state.theme === 'light' ? 'fa-moon' : 'fa-sun'}`;
}

// --- SEARCH ---
function buildSearchIndex() {
    searchIndex = lunr(function () {
        this.ref('id'); this.field('title', { boost: 10 }); this.field('content');
        state.notes.forEach(note => { if(note) this.add(note); });
    });
}
function handleSearch(event) {
    const query = event.target.value;
    if (!query) { renderNoteList(); return; }
    try {
        const results = searchIndex.search(`*${query}*`);
        const resultNotes = results.map(result => findNoteById(result.ref));
        renderNoteList(resultNotes);
    } catch (e) { renderNoteList(); }
}

// --- IMPORT / EXPORT ---
function exportAllNotes() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `markdown-notes-backup-${Date.now()}.json`;
    a.click();
}
function importNotes(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedState = JSON.parse(e.target.result);
            if (importedState.notes && Array.isArray(importedState.notes)) {
                if(confirm("This will overwrite your current notes. Are you sure?")) {
                    state = importedState;
                    saveState();
                    alert('Notes imported successfully! Reloading...');
                    location.reload();
                }
            } else { alert('Invalid backup file format.'); }
        } catch (error) { alert('Error reading backup file.'); }
    };
    reader.readAsText(file);
    event.target.value = null;
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    newNoteBtn.addEventListener('click', createNewNote);
    deleteNoteBtn.addEventListener('click', deleteActiveNote);
    themeToggleBtn.addEventListener('click', toggleTheme);
    searchInput.addEventListener('input', handleSearch);
    
    toggleSidebarBtn.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
        state.sidebarCollapsed = document.body.classList.contains('sidebar-collapsed');
        saveState();
        toggleSidebarBtn.querySelector('i').className = state.sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    });

    noteTitleInput.addEventListener('input', (e) => {
        if(state.activeNoteId) {
            const note = findNoteById(state.activeNoteId);
            if(note) {
                note.title = e.target.value;
                note.updatedAt = Date.now();
                saveState();
                updateNoteInList(state.activeNoteId);
                buildSearchIndex();
            }
        }
    });
    
    exportBtn.addEventListener('click', exportAllNotes);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importNotes);

    const resizer = document.getElementById('resizer');
    const leftPanel = document.querySelector('.editor-panel');
    const onMouseMove = (e) => {
        const parent = resizer.parentElement;
        const parentRect = parent.getBoundingClientRect();
        const leftPanelWidth = e.clientX - parentRect.left;
        const leftPanelPercent = (leftPanelWidth / parentRect.width) * 100;
        if (leftPanelPercent < 15 || leftPanelPercent > 85) return;
        leftPanel.style.flexBasis = `${leftPanelPercent}%`;
    };
    const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        document.body.classList.remove('is-resizing');
    };
    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        document.body.classList.add('is-resizing');
    });
}