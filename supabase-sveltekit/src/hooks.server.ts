import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/dbtypes';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get: (key) => event.cookies.get(key),
				set: (key, value, options) => {
					event.cookies.set(key, value, options);
				},
				remove: (key, options) => {
					event.cookies.delete(key, options);
				}
			}
		}
	);

	/**
	 * a little helper that is written for convenience so that instead
	 * of calling `const { data: { session } } = await supabase.auth.getSession()`
	 * you just call this `await getSession()`
	 */
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	const response =
		event.request.method === 'OPTIONS'
			? await resolve(event, {
					filterSerializedResponseHeaders(name) {
						return name === 'content-range';
					}
				})
			: new Response(JSON.stringify({}), { status: 200 });
	// console.log(event.request.headers.get("origin"))  e.g. chrome-extension://aomnlngcbnepejemfdjlllcmfhdppkio or localhost:5174
	const origin = event.request.headers.get('origin');
	// here if we want access control we can check origin programatically
	response.headers.set('Access-Control-Allow-Origin', origin || '*');
	response.headers.set('Access-Control-Allow-Credentials', 'true');
	return response;
};
