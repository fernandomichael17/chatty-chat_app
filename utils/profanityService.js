const axios = require("axios");

// URL API Python - sesuaikan dengan konfigurasi Anda
const API_URL = "http://localhost:5000";
const FALLBACK_MODE = "allow"; // 'allow' or 'block'

// Fungsi untuk memeriksa pesan dengan API Python
async function checkMessage(message) {
  try {
    const response = await axios.post(`${API_URL}/check`, {
      text: message,
    });

    return {
      isProfane: response.data.is_profane,
      confidence: response.data.confidence,
      text: response.data.text,
      classLabel: response.data.class_label,
    };
  } catch (error) {
    console.error("Error saat memeriksa pesan:", error.message);

    // Strategi fallback jika API tidak tersedia
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      console.warn(
        "API profanity tidak tersedia. Menggunakan mode fallback:",
        FALLBACK_MODE
      );

      // Jika mode fallback adalah 'allow', loloskan pesan
      // Jika mode fallback adalah 'block', block pesan yang mencurigakan
      return {
        isProfane: FALLBACK_MODE === "block",
        confidence: 0,
        text: message,
        error: "API tidak tersedia",
      };
    }

    // Untuk error lain, loloskan pesan
    return {
      isProfane: false,
      confidence: 0,
      text: message,
      error: error.message,
    };
  }
}

// Fungsi untuk memeriksa status API
async function checkAPIStatus() {
  try {
    const response = await axios.get(`${API_URL}/status`);
    return response.data;
  } catch (error) {
    console.error("API profanity filter tidak tersedia:", error.message);
    return {
      status: "offline",
      error: error.message,
      model_loaded: false,
      tokenizer_loaded: false,
    };
  }
}

module.exports = {
  checkMessage,
  checkAPIStatus,
};
