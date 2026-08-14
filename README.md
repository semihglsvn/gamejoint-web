# GameJoint - Frontend Client

GameJoint is a comprehensive video game database and community review platform. This repository contains the Next.js frontend client, which interfaces with the dedicated Spring Boot backend to deliver dynamic game data, user authentication, and critical reception aggregation.

## Live Application
**Production URL:** [https://game-joint.net](https://game-joint.net)

## System Architecture

This application is decoupled into a standalone client-server architecture. 

* **Frontend (Current Repository):** Next.js App Router, React, Tailwind CSS.
* **Backend API Repository:** [semihglsvn/gamejoint-api](https://github.com/semihglsvn/gamejoint-api)

The frontend is responsible for rendering the UI, managing client-side state via custom hooks, and handling SEO optimization through Server Components and canonical routing. All business logic, database transactions, and data persistence are managed exclusively by the backend API.

## Core Technologies

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Authentication:** HttpOnly JWT Cookies, Google OAuth 2.0
* **External Data Provider:** RAWG Video Games Database API

## Key Features

* **Server-Side Rendering (SSR) & SEO:** Dynamic metadata generation and canonical URL routing for game detail pages to ensure optimal search engine indexing.
* **Separation of Concerns:** Strict decoupling of UI components and business logic using custom React hooks.
* **Secure Authentication:** Implementation of HttpOnly cookies for session management, mitigating XSS vulnerabilities.
* **Review Aggregation (JointScore):** Algorithmic distinction and aggregation of standard user reviews versus verified critic scores.
* **Advanced Search & Filtering:** Debounced asynchronous search with multi-parameter filtering (genre, platform, score) and pagination.
* **Dynamic Theming:** System-integrated dark/light mode execution utilizing a custom context provider to eliminate unstyled content flashes (FOUC).

## Repository Note
This repository contains the production build configuration. Local development and environment initialization steps are omitted as this represents the deployed client architecture.
