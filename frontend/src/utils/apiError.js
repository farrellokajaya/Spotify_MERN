const getApiError = (
  error,
  fallbackMessage = "Terjadi kesalahan"
) => {
  if (error.code === "ECONNABORTED") {
    return {
      message:
        "Server terlalu lama merespons. Silakan coba kembali.",
      errors: [],
    };
  }

  if (!error.response) {
    return {
      message:
        "Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.",
      errors: [],
    };
  }

  const responseData = error.response.data;

  return {
    message:
      responseData?.message || fallbackMessage,
    errors: Array.isArray(responseData?.errors)
      ? responseData.errors
      : [],
  };
};

export default getApiError;