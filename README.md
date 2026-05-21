# Philippine Cooperative Accounting System (RA 9520)

A comprehensive, single-file React application for managing cooperative accounting, compliant with CDA regulations.

## Deployment Instructions

### Method 1: Rapid Development / Testing (No Install)
Since this is a single `.jsx` file, you can run it directly in a browser using a basic HTML wrapper with CDNs.

1. Create a file named `index.html`.
2. Paste the following content:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cooperative Accounting System</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-slate-50">
    <div id="root"></div>
    <script type="text/babel">
        // Paste the entire content of CoopSystem.jsx here
        // (Remember to remove the 'import' statements at the top)
    </script>
</body>
</html>
```
3. Open `index.html` in any modern web browser.

### Method 2: Standard React Project (Vite)
To deploy this as a production-ready web app:

1. **Initialize Project**:
   ```bash
   npm create vite@latest my-coop-app -- --template react
   cd my-coop-app
   npm install lucide-react
   ```
2. **Setup Tailwind**:
   Follow the [Vite Tailwind CSS guide](https://tailwindcss.com/docs/guides/vite) to install and configure Tailwind.
3. **Add Component**:
   Copy `CoopSystem.jsx` into your `src/` directory.
4. **Update `App.jsx`**:
   ```javascript
   import CoopSystem from './CoopSystem'
   function App() { return <CoopSystem /> }
   export default App
   ```
5. **Run & Build**:
   ```bash
   npm run dev   # For local development
   npm run build # To generate files for deployment (Netlify, Vercel, etc.)
   ```

## Admin Demo Credentials
- **Manager**: admin / admin123
- **Teller**: teller1 / teller123
- **Collector**: collector1 / col123
- **Accountant**: accountant / acct123
- **Member**: juan / member123
