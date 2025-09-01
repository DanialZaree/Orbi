export default function LoginView() {
  const handleGoogleLogin = () => {
    /* global google */
    google.accounts.id.initialize({
      client_id: "YOUR_GOOGLE_CLIENT_ID", // Replace with your Google Client ID
      callback: handleCredentialResponse,
    });
    google.accounts.id.prompt(); // Display the One Tap prompt
  };
}
