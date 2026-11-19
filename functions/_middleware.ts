export const onRequest: any = async (context: any) => {
  try {
    const url = new URL(context.request.url);
    if (url.hostname === 'freshcommits.com') {
      url.hostname = 'www.freshcommits.com';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }
  } catch {
    // Pass through safely on malformed URLs
  }
  return context.next();
};
