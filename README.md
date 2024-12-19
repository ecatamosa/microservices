# Microservices

This project contains a Vue.js component that displays a data table for managing and viewing product information. It is part of a microservices architecture focusing on **Order Management** and **Inventory Management**.

## Features

- **Search Functionality**: Users can search products by title.
- **Data Table**: Dynamically displays product data with headers.
- **Vuetify Integration**: Utilizes Vuetify components for UI consistency.
- **Reusable Component**: Modular design for reusability.

## Project Structure

- **components**: Contains Vue components, including `ProductsTable.vue`.
- **pages**: Includes application pages such as `Dashboard.vue` and `Shop.vue`.
- **lib**: Contains utility files like `supabase.js`.
- **plugins**: Plugin configurations, including `vuetify.js`.
- **router**: Application routing configurations.
- **styles**: Global styles for the project.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ecatamosa/microservices.git
   cd <repository-folder>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open the application in your browser at `http://localhost:8052`.

## Usage

1. Navigate to the "Shop" page to view the Products Table.
2. Use the search bar to filter products by their title.
3. Interact with the table to manage product data.

## Components Overview

### `ProductsTable.vue`

- **Props**:
  - `products`: Array of product data.
  - `headers`: Array of table headers.

- **Slots**:
  - `item.title`: Slot for customizing the display of the product title.

### Key Sections:

- **Search Field**: A text field for searching products.
- **Data Table**: Displays product data with filtering capabilities.

## Technologies Used

- Vue.js
- Vuetify
- Supabase
- Node.js

## Contributions

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Submit a pull request.

## License

This project is open-source and available under the [MIT License](LICENSE).
