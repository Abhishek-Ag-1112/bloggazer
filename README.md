# Bloggazer

Bloggazer is a modern, visually immersive blogging platform built with React, Vite, and 3D web technologies. It combines high-performance web standards with rich aesthetics to deliver a premium user experience.
Deploy link : http://blogs-afdaa.web.app/

## 🚀 Technology Stack

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations & 3D**:
  - [GSAP](https://gsap.com/) (GreenSock Animation Platform)
  - [Motion](https://motion.dev/)
  - [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) & [Three.js](https://threejs.org/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown Support**: React Markdown + Remark GFM

### Backend / Services
- **Firebase**:
  - Authentication
  - Cloud Firestore (Database)
  - Storage
- **Supabase**: Integration included

## 🛠️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Abhishek-Ag-1112/bloggazer.git
    cd bloggazer
    ```

2.  **Navigate to the project directory**
    ```bash
    cd bloggazers/project/frontend
    ```

3.  **Install dependencies**
    ```bash
    npm install
    ```

4.  **Set up Environment Variables**
    Create a `.env` file in the `frontend` directory and add your Firebase/Supabase credentials:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    # ... other config keys
    ```

5.  **Run the Development Server**
    ```bash
    npm run dev
    ```

## 🌟 Features

- **Immersive UI**: Custom 3D backgrounds and smooth transitions using GSAP and Three.js.
- **Admin Dashboard**: Full content management capabilities.
- **Markdown Editing**: Write and format blog posts easily.
- **Responsive Design**: Fully optimized for desktop and mobile devices.
- **Secure Authentication**: Robust user management via Firebase.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
