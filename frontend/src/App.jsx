import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { useAuth } from "@clerk/react";
import { Button } from "@heroui/react";
import { Toaster } from "react-hot-toast";

import { WallpaperProvider } from "./context/WallpaperContext";
import { ThemeProvider } from "./context/ThemeContext";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import PageLoader from "./components/PageLoader";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { isSignedIn, isLoaded } = useAuth();

  // selecting single fields keeps re-renders to a minimum
  const authUser = useAuthStore((state) => state.authUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) checkAuth();
    else clearAuth();
  }, [checkAuth, clearAuth, isLoaded, isSignedIn]);

  if (!isLoaded || (isSignedIn && isCheckingAuth)) return <PageLoader />;

  // signed in with Clerk, but our API could not load the profile (server down, misconfigured, ...)
  if (isSignedIn && !authUser) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
        <p className="text-lg font-semibold">Could not reach the server</p>
        <p className="max-w-sm text-sm text-muted">Check your connection and try again.</p>
        <Button variant="primary" onPress={checkAuth}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route path="/" element={isSignedIn ? <ChatPage /> : <Navigate to="/auth" replace />} />
          <Route path="/auth" element={!isSignedIn ? <AuthPage /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App;
