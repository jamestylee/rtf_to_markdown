# Markdown Notes App (WYSIWYG -> Markdown)

A feature-rich, browser-based notes application built with vanilla HTML5, CSS3, and JavaScript. This app focuses on a user-friendly WYSIWYG (What You See Is What You Get) rich-text editing experience that generates clean Markdown code in real-time. It's perfect for users who prefer a visual editor but need Markdown output.

![Screenshot of the RTF to Markdown App](placeholder.png)
*(Replace `placeholder.png` with a real screenshot of your app!)*

---

## Core Features

-   **Rich-Text Editor:** An intuitive WYSIWYG editor on the left powered by **Quill.js**, complete with a full toolbar for formatting text, lists, headers, and more.
-   **Live Markdown Preview:** As you type and format in the editor, clean, corresponding Markdown code is generated and displayed on the right.
-   **HTML to Markdown Conversion:** Uses the powerful **Turndown.js** library to ensure high-quality Markdown generation.
-   **Polished UI/UX:**
    -   Resizable columns allow you to customize your workspace.
    -   A fully collapsible sidebar saves screen real estate.
    -   A carefully designed layout that avoids UI bugs and element overlaps.
-   **Data Persistence:** All notes (saved as Markdown) and UI states (theme, sidebar position) are saved to your browser's `localStorage`.
-   **Powerful Search:** Near-instant full-text search of all your Markdown notes, indexed by **Lunr.js**.
-   **Custom Theming:** A sleek dark/light mode that persists across sessions.
-   **Data Management:** Easily import and export all your notes as a single JSON file for backup.

## Tech Stack

-   **Core:** HTML5, CSS3, Vanilla JavaScript (Classic Scripts)
-   **Editor:** [Quill.js](https://quilljs.com/)
-   **HTML to Markdown:** [Turndown.js](https://github.com/mixmark-io/turndown)
-   **Markdown to HTML (for loading notes):** [Marked.js](https://marked.js.org/)
-   **Syntax Highlighting (for preview):** [highlight.js](https://highlightjs.org/)
-   **Client-Side Search:** [Lunr.js](https://lunrjs.com/)
-   **Icons:** [Font Awesome](https://fontawesome.com/)

## How to Run Locally

This project uses classic JavaScript scripts, which may allow it to run when opening `index.html` directly from the filesystem (`file:///`). However, for best results and to avoid any potential browser restrictions, serving the files from a local server is highly recommended.

1.  **Navigate to the project directory** in your terminal:
    ```bash
    cd path/to/your/wysiwyg-notes-app
    ```

2.  **Start a local server.** If you have Python 3, run:
    ```bash
    python3 -m http.server
    ```
    (If you have an older version of Python, you might need to run `python -m SimpleHTTPServer`).

3.  **Open the application** in your web browser by navigating to:
    [http://localhost:8000](http://localhost:8000)

---
