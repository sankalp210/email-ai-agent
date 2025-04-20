export async function withRetry(fn, retries = 3, delay = 1000) {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (err) {
        console.warn(`Attempt ${attempt + 1} failed: ${err.message}`);
        attempt++;
        if (attempt < retries) {
          await new Promise(res => setTimeout(res, delay * Math.pow(2, attempt))); // exponential backoff
        } else {
          throw err;
        }
      }
    }
  }
  