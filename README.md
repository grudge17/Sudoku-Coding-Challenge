# Sudoku Game

##  Project Overview

This project is an interactive Sudoku game developed as a demonstration of modern web development capabilities.

##  Core Features

*   **Dynamic Sudoku Grid:** Interactive and responsive 9x9 grid.
*   **Client-Side Puzzle Generation:** Ensures unique puzzles are generated efficiently in the browser for various skill levels.
*   **Multiple Difficulty Levels:** Catering to a wide range of users (Easy, Medium, Hard, Expert).
*   **Real-time Input Validation:** Instantaneous feedback on cell conflicts (row, column, 3x3 subgrid).
*   **Interactive Timer:** Tracks gameplay duration.
*   **Comprehensive Game Controls:**
    *   **New Game:** Initiate a fresh puzzle.
    *   **Check Solution:** Validate the current board state.
    *   **Hint System:** Reveal a correct number for a selected empty cell.
    *   **Auto-Solve:** Display the complete solution.
*   **Responsive & Modern UI:** Aesthetically pleasing design optimized for various screen sizes using CSS best practices.
*   **State Management:** Efficiently handled using React Hooks for a predictable and performant application state.

##  Tech Stack 

These technologies were chosen to build this app

*   **React (v19+):** Chosen for its component-based architecture, declarative UI, and extensive ecosystem, facilitating the creation of a modular and interactive user interface.

*   **Lodash:** Employed for its utility functions, specifically for array manipulation (`_.shuffle`), deep cloning (`_.cloneDeep`) to ensure immutability in state management, and random number generation (`_.random`) for puzzle generation and hints. These utilities help write more concise and robust logic.


## ⚙️ Software Engineering & Development Workflow

I developed this project adhering to best software development practices.

### Version Control & Branching Strategy

*   **Git:** Utilized for version control.
*   **Main Branch (`Main`):** Emulating Production Environment Code
*   **Feature Branche (`feature/dev-task`):** Branch I used to work on specific features and sub tasks. 
*   **Pull Requests (PRs):** Upon completion, features were merged into the `Main` branch via Pull Requests. This workflow facilitates:
    *   **Code Review:** (Simulated for this project) Allowing for peer review to catch bugs, suggest improvements, and ensure adherence to coding standards.
    *   **Discussion:** A platform for discussing implementation details before merging.
    *   **CI/CD Integration:** (Conceptual) PRs are typical triggers for automated builds, tests, and linting in a CI/CD pipeline.


## Getting Started

To set up and run this project locally, please follow these steps:

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (v9.x or later recommended) or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/grudge17/Sudoku-Coding-Challenge.git # Replace with the actual repository URL
    cd sudoku-coding-challenge
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

### Running Locally

Once dependencies are installed, start the development server:

Using npm:
```bash
npm run dev
```
Or using yarn:
```bash
yarn dev
```
This will launch the Vite development server, typically accessible at `http://localhost:5173`. Open this URL in your web browser.

##  Available Scripts

*   `npm run dev` or `yarn dev`: Starts the development server.
*   `npm run build` or `yarn build`: Creates a production-ready build in the `dist` folder.
*   `npm run lint` or `yarn lint`: Runs ESLint to analyze code for potential issues.
*   `npm run preview` or `yarn preview`: Serves the production build locally for testing.

##  Future Enhancements (Potential)

*   **Advanced Uniqueness Check:** Implement a more robust algorithm to ensure generated puzzles have only one unique solution.
*   **Number Palette Input:** Allow users to select numbers from a palette instead of typing.
*   **Keyboard Navigation:** Full keyboard accessibility for grid navigation and input.
*   **Themes:** Light/Dark mode toggle.
*   **Unit & Integration Tests:** Implement a comprehensive test suite using a framework like Jest and React Testing Library.

---

### Sudoku Logic (`src/utils/sudokuLogic.ts`)

This file contains the core algorithms and helper functions for the Sudoku game:

*   **Grid Generation (`generateSudoku`):**
    *   Starts by creating a fully solved Sudoku grid using a backtracking algorithm (`solveSudokuFill`).
    *   Then, it removes a certain number of cells from the solved grid to create the puzzle. The number of cells removed depends on the selected difficulty level.
    *   Lodash\'s `_.cloneDeep` is used to create copies of the grid, and `_.shuffle` is used to randomize number placement during generation. `_.random` is used for selecting cells to remove and for hint generation.
*   **Difficulty Level Implementation:**
    *   The difficulty (Easy, Medium, Hard, Expert) is determined by the number of cells initially revealed.
    *   The `generateSudoku` function receives a numerical `difficultyLevel` (e.g., 0.2 for Easy, 0.85 for Expert).
    *   Based on this level, a range for the number of cells to remove is set:
        *   **Easy:** Fewer cells removed (e.g., 40-46 cells removed, leaving ~35-41 clues).
        *   **Medium:** Moderate number of cells removed (e.g., 47-53 cells removed, leaving ~28-34 clues).
        *   **Hard/Expert:** More cells removed (e.g., 54-58 cells removed, leaving ~23-27 clues).
    *   The actual number of cells to remove within the determined range is randomized, as is the selection of which specific cells are removed. This ensures puzzle variety.
    *   Harder levels present fewer initial clues, requiring more complex deductions from the player.
*   **Validation (`isSafe`):** Checks if a number can be safely placed in a cell according to Sudoku rules (no repetition in the same row, column, or 3x3 subgrid).
