import { publish } from 'gh-pages';

publish(
	'public',
	{
		branch: 'gh-pages',
		repo: 'https://github.com/el3um4s/petits-chevaux.git', // Update to point to your repository
		user: {
			name: 'cliff',
			email: 'crypticwasp254@gmail.com'
		},
		dotfiles: true
	},
	() => {
		console.log('Deploy Complete!');
	}
);

// "deploy": "touch build/.nojekyll && gh-pages -d build -t true",
// "deploy": "node ./gh-pages.js",
