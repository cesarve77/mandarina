/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
//import javascript from 'highlight.js/lib/languages/javascript';
const typescript = require('highlight.js/lib/languages/typescript')

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
    {
        caption: 'User1',
        // You will need to prepend the image path with your baseUrl
        // if it is not '/', like: '/test-site/img/docusaurus.svg'.
        image: '/img/docusaurus.svg',
        infoLink: 'https://www.facebook.com',
        pinned: true,
    },
];
const markdownInclude = require('./include')

const siteConfig = {
    docsSideNavCollapsible:true,
    title: 'Mandarina', // Title for your website.
    tagline: 'Full-stack react+apollo+graphql+prisma.io library',
    url: 'https://cesarve77.github.io', // Your website URL
    baseUrl: '/mandarina/', // Base URL for your project */
    // For github.io type URLs, you would set the url and baseUrl like:
    //   url: 'https://facebook.github.io',
    //   baseUrl: '/test-site/',

    // Used for publishing and more
    projectName: 'mandarina',
    organizationName: 'cesarve77',
    // For top-level user or org sites, the organization is still the same.
    // e.g., for the https://JoelMarcey.github.io site, it would be set like...
    //   organizationName: 'JoelMarcey'

    // For no header links in the top nav bar -> headerLinks: [],
    headerLinks: [
        {doc: 'boilerplate', label: 'Docs'},
        {blog: true, label: 'Blog'},
    ],

    // If you have users set above, you add it here:
    users,

    /* path to images for header/footer */
    headerIcon: 'img/mandarina_logo.png',
    footerIcon: 'img/mandarina_logo.png',
    favicon: 'img/favicon.png',

    /* Colors for website */
    colors: {
        primaryColor: '#d15926',
        secondaryColor: '#f08329',
    },

    /* Custom fonts for website */
    /*
    fonts: {
      myFont: [
        "Times New Roman",
        "Serif"
      ],
      myOtherFont: [
        "-apple-system",
        "system-ui"
      ]
    },
    */

    // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
    copyright: `Copyright © ${new Date().getFullYear()} Cesar Ramos`,
    usePrism: ['jsx', 'typescript', 'javascript'],
    highlight: {
        // Highlight.js theme to use for syntax highlighting in code blocks.
        theme: 'dracula',

    },

    // Add custom scripts here that would be placed in <script> tags.
    scripts: ['https://buttons.github.io/buttons.js'],

    // On page navigation for the current documentation page.
    onPageNav: 'separate',
    // No .html extensions for paths.
    cleanUrl: true,

    // Open Graph and Twitter card images.
    ogImage: 'img/mandarina_logo.png',
    twitterImage: 'img/mandarina_logo.png',

    // Show documentation's last contributor's name.
    // enableUpdateBy: true,

    // Show documentation's last update time.
    // enableUpdateTime: true,

    // You may provide arbitrary config keys to be used as needed by your
    // template. For example, if you need your repo's URL...
    //   repoUrl: 'https://github.com/facebook/test-site',
    markdownPlugins: [function (md) {
        md.use(markdownInclude,'../docs/includes')
    }]
};

module.exports = siteConfig;
