import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import ExplorePage from "./pages/ExplorePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BookingPage from "./pages/BookingPage";

// Layout wrapper that shows Navbar on most pages (except login/register)
function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

// Auth pages don't show the navbar
function AuthLayout({ children }) {
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      {/* Load Outfit font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');`}</style>

      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public pages with navbar */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <LandingPage />
                </MainLayout>
              }
            />
            <Route
              path="/explore"
              element={
                <MainLayout>
                  <ExplorePage />
                </MainLayout>
              }
            />
            <Route
              path="/about"
              element={
                <MainLayout>
                  <AboutPage />
                </MainLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              }
            />
            <Route
              path="/book/:type/:id"
              element={
                <MainLayout>
                  <BookingPage />
                </MainLayout>
              }
            />

            {/* Auth pages — no navbar */}
            <Route
              path="/login"
              element={
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              }
            />
            <Route
              path="/register"
              element={
                <AuthLayout>
                  <RegisterPage />
                </AuthLayout>
              }
            />

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <MainLayout>
                  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-6">
                    <p className="text-navy font-bold text-6xl">404</p>
                    <p className="text-navy/60 text-lg">Page not found</p>
                    <a href="/" className="px-6 py-3 rounded-full bg-violet text-white font-semibold text-sm">
                      Go home
                    </a>
                  </div>
                </MainLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}
