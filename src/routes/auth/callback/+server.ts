import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	const {
		url,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		locals: { supabase }
	} = event;
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      throw redirect(303, `/${next.slice(1)}`);
    }
  }

  // return the user to an error page with instructions
  throw redirect(303, '/auth/auth-code-error');
};