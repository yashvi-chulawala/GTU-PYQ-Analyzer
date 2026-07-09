const API_URL = import.meta.env.VITE_API_URL;

export async function wakeBackend() {
  while (true) {
    try {
      const response = await fetch(`${API_URL}/health`);

      if (response.ok) {
        console.log("✅ Backend is awake!");
        return;
      }
    } catch (error) {
      console.log("⏳ Waiting for backend...");
    }

    // Wait 2 seconds before trying again
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}