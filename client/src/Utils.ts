class Utils {
  /**
   * fetch based on dev / prod env.
   */
  public static async fetch(
    input: RequestInfo,
    init?: RequestInit | undefined
  ): Promise<Response> {
    const env = process.env.NODE_ENV;
    if (env === 'production') {
      return fetch(input, init);
    }
    let url = input.toString();
    url = `http://localhost:8080${url}`;
    return fetch(url, init);
  }
}

export default Utils;
