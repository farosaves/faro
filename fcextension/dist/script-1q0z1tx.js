
				{
					const __sveltekit_v54856 = {
						base: new URL(".", location).pathname.slice(0, -1),
						env: null
					};

					const element = document.body.firstElementChild;

					const data = [null,null];

					Promise.all([
						import("./app/immutable/entry/start.ISLIv5N9.js"),
						import("./app/immutable/entry/app.37sq_fIn.js")
					]).then(([kit, app]) => {
						kit.start(app, element, {
							node_ids: [0, 2],
							data,
							form: null,
							error: null
						});
					});
				}
			