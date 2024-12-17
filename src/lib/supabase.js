import { createClient } from "@supabase/supabase-js";
const supabaseLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message); // Throw the error if something goes wrong
  }
};

// Main logout function
async function doLogout() {
  const confirmed = window.confirm("Are you sure you want to logout?");
  if (!confirmed) {
    return; // Exit if the user cancels
  }

  try {
    await supabaseLogout(); // Call the Supabase logout function

    // Clear local storage
    localStorage.clear();

    alert("Logout Successfully!");
  } catch (error) {
    alert("Logout Failed: " + error.message); // Handle any errors
  }
}

export { doLogout };
// Create and export Supabase client
export const supabase = createClient(
  "https://tjvffxanezuwhojqonye.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdmZmeGFuZXp1d2hvanFvbnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MzIxOTksImV4cCI6MjA1MDAwODE5OX0.AybLqLgEEm0c6hUVw2p83YAwCSVPEOnWzuzwMioghYo"
);
