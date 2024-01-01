// import adapter from '@sveltejs/adapter-static';
import adapter from '@sveltejs/adapter-auto';

const config = {
  kit: {
    adapter: adapter(),
	appDir: 'app',
  },
};

export default config;
