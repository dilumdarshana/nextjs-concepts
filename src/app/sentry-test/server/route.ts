// Reading request headers makes this route handler dynamic,
// so it won't be prerendered during build.
export async function GET(request: Request) {
  request.headers.get('host');
  throw new Error('[Sentry Test] Server error from route handler');
}
