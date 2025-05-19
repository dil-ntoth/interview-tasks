function copyUrlToClipboard(url) {
  try {
    navigator.clipboard.writeText(url).then(() => {
      console.info("Successfully copied URL");
    });
  } catch (err) {
    return { error: err };
  }

  return { success: true };
}
