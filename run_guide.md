# Taskpilot: Launch Guide 🚀

To get the Taskpilot application up and running, follow these steps. You will need two terminal windows open.

### 1. Backend Setup
The backend serves the API and connects to your database.

1.  **Navigate to the backend directory:**
    ```powershell
    cd backend
    ```
2.  **Start the server:**
    Since dependencies are already installed and the `.env` file is configured, you can start the server directly:
    ```powershell
    node server.js
    ```
    *The backend should now be running on [http://localhost:5000](http://localhost:5000).*

---

### 2. Frontend Setup
The frontend provides the user interface.

1.  **Open a new terminal window.**
2.  **Navigate to the frontend directory:**
    ```powershell
    cd frontend
    ```
3.  **Start the development server:**
    ```powershell
    npm run dev
    ```
    *The frontend will be available at the URL shown in your terminal (usually [http://localhost:5173](http://localhost:5173)).*

---

### 💡 Tips
- **Keep both terminals open**: Closing either will stop that part of the application.
- **Backend Logs**: Watch the backend terminal for database connection status or API errors.
- **Frontend Hot-Reload**: Any changes you make to the code will automatically reflect in the browser.
