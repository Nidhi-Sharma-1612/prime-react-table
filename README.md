# Artworks Table

A dynamic React application showcasing paginated artwork data using PrimeReact and Tailwind CSS, powered by the Art Institute of Chicago API.

---

## Features

- **Dynamic Table**: Displays paginated, searchable, and selectable artwork data.
- **Multi-Page Fetching**: Dynamically fetch additional data when more rows are requested.
- **Row Selection**: Specify and select a given number of rows dynamically.
- **Modern UI**: Built with PrimeReact components and styled using Tailwind CSS.

---

## Installation

### Prerequisites

- Node.js (>= 14.x)
- npm or yarn

### Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd <project-directory>
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## Usage

1. **Select Rows**:

   - Click the **ChevronDown** icon in the `Title` column header.
   - Enter the number of rows to select (e.g., `5`).
   - Click **Submit** to select the specified rows.

2. **Pagination**:

   - Use the pagination controls to navigate between pages.
   - Data is fetched dynamically as needed.

3. **Deployed Link**:
   - Access the deployed application here: https://artworks-table.netlify.app/

---

## Technologies Used

- **React + Vite + TypeScript**
- **PrimeReact**
- **Tailwind CSS**
- **Art Institute of Chicago API**

---

## API Details

**Endpoint**:

```
https://api.artic.edu/api/v1/artworks
```

---
