const API_URL = import.meta.env.VITE_API_URL;

export async function wakeBackend() {
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(`${API_URL}/health`);

      if (res.ok) {
        console.log("Backend awake");
        return true;
      }
    } catch (e) {
      console.log("Retrying...");
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return false;
}