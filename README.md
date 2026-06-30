# Paperplane Task Dashboard Frontend

Step 1 of the Full Stack Developer Technical Assignment for Paper Plane. This is a single-page application built using React 18+, TypeScript, Vite, MaterialUI (MUI), and Zustand.

## Technology Decisions

### State Management: Zustand
We chose **Zustand** instead of React Context or Redux:
1. **Performance**: Zustand avoids unnecessary re-renders because components can select the exact state properties they depend on.
2. **Minimal Boilerplate**: Unlike Redux, Zustand requires no complex action creators, reducers, or context providers. Stores are defined as simple hooks.
3. **Simplicity**: Extremely easy to read, write, and maintain, allowing us to keep state logic completely decoupled from UI components.

### UI & UX: MaterialUI (MUI v5+)
- Modern typography, components, and layout structures.
- Custom styled buttons, input fields, and cards aligned to a premium slate-indigo theme.
- Responsive design ensuring the task dashboard fits properly on both desktop and mobile screens.

### Drag and Drop: `@hello-pangea/dnd`
- Maintained fork of the standard `react-beautiful-dnd` supporting React 18/19.
- Used to allow smooth task column transitions between **To Do**, **In Progress**, and **Done** states.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The client application will boot on `http://localhost:5173`. Make sure the backend server (port 4000) is running so tasks and authentications can be processed.

3. **Run Unit & Component Tests**:
   ```bash
   npm test
   ```
   Tests use Vitest and React Testing Library to execute component renderings and Zustand filtering selectors.
