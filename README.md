# nyumbani-management-system
A modular web application with RESTful API integration, persistent JSON Server data storage, dynamic UI feedback, and tested JavaScript logic.

## Live demo link (GitHub Pages)
https://github.com/karumenick-dev/nyumbani-management-system.git

## Features list (bullet points)
* Full CRUD Operations: Perform Create, Read, Update (`PUT`), Partial Update (`PATCH`), and Delete actions via a RESTful JSON Server API.

* Responsive & Accessible Design: Adaptable layout built with semantic HTML and a cohesive 3-color palette that scales across mobile, tablet, and desktop screens.

* Input Validation & State Feedback: Real-time form input checking, dynamic visual loading indicators, and error notifications for network requests.

* Modular JavaScript Architecture: Clean separation of DOM manipulation, network requests, and application logic using ES6 modules.

* Automated Testing: Unit and integration tests maintaining a minimum of 50% test coverage across key JavaScript functions.

## Technologies used
* HTML: Semantic markup for accessible, clean document structure without embedded script logic.

* CSS: Responsive web design using media queries, modern layout systems, and custom color properties.

* JavaScript: Modular scripting handling DOM interactions, form validation, and asynchronous HTTP calls (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

* JSON Server: Deployed mock REST API providing cloud-hosted data persistence across application reloads.

* Git & GitHub: Version control utilizing feature branches, pull requests, a Project Board, and continuous deployment via GitHub Pages.

* Testing: Unit tests are written using Node.js's native test runner (`node --test`) to verify API configurations, data schemas, and calculation logic.

Run tests using:
```bash
npm test

## How to run it locally
1. Open the terminal and clone the repository:

   git clone https://github.com/karumenick-dev/nyumbani-management-system.git

2. Navigate into the project directory:

   cd nyumbani-management-system

3. Install project dependencies:

   npm install

4. Start the local mock server and test runner:

   npm run server
   npm test

5. Open `index.html` in your web browser (or use the VS Code Live Server extension) to view the application live.

## One or two sentences on what I learned
Through building this project, I strengthened my understanding of modular JavaScript organization. I also gained practical experience in how to use Figma for creating a wireframe for easier UI/UX design.