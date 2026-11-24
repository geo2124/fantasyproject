
export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    const { auth } = await import('./firebase');
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      init = init || {};
      init.headers = {
        ...init.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }
  return fetch(input, init);
};
