import { Routes, Route } from "react-router-dom";
import { Layout, ProtectedRoute, AdminRoute } from "@/components/layout";
import { LoginForm, RegisterForm, VerifyEmailPage, UserProfilePage } from "@/features/auth";
import {
  ListingsPage,
  ListingDetailPage,
  CreateListingPage,
  EditListingPage,
  MyListingsPage,
  LikedListingsPage,
} from "@/features/listings";
import { AdminPage } from "@/features/admin";
import { ChatListPage, ChatPage } from "@/features/chat";

export const App = () => (
  <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<ListingsPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />

        {/* Protected routes */}
        <Route
          path="/listings/new"
          element={
            <ProtectedRoute>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/:id/edit"
          element={
            <ProtectedRoute>
              <EditListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MyListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/liked-listings"
          element={
            <ProtectedRoute>
              <LikedListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <ChatListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats/:conversationId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Routes>
    </Layout>
);
