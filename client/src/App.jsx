import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { RequireAuth } from "./components/RequireAuth";
import { About } from "./pages/About";
import { CreateListing } from "./pages/CreateListing";
import { Home } from "./pages/Home";
import { Listing } from "./pages/Listing";
import { Profile } from "./pages/Profile";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Admin } from "./pages/Admin";
import { RequireRole } from "./components/RequireRole";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/listing/:id" element={<Listing />} />

        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<Profile />} />
          <Route element={<RequireRole roles={["admin", "agent", "owner"]} />}>
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/update-listing/:id" element={<CreateListing />} />
          </Route>
          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
