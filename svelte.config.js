import adapter from '@sveltejs/adapter-static';

// For GitHub Pages under https://<user>.github.io/<repo>/ set BASE_PATH=/<repo>
// (the deploy workflow does this automatically). Leave empty for a custom domain.
const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', fallback: '404.html', strict: true }),
    paths: { base, relative: true },
    prerender: { handleHttpError: 'fail', handleMissingId: 'warn' }
  }
};
