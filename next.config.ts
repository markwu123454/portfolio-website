import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async redirects() {
        // /work was renamed to /projects. 301 so old links and search results move over.
        // Query strings (e.g. ?domain=drones) are carried across automatically.
        return [
            { source: '/work', destination: '/projects', statusCode: 301 },
            // Combat robotics moved to /projects/infernope; /projects/combat stays free for new work.
            { source: '/work/combat', destination: '/projects/infernope', statusCode: 301 },
            { source: '/work/:slug*', destination: '/projects/:slug*', statusCode: 301 },
            // /now was retired; send old links home.
            { source: '/now', destination: '/', statusCode: 301 },
            // Unlisted short link to the MercedTime Chrome extension. 307 so browsers don't cache it.
            {
                source: '/mt',
                destination: 'https://chromewebstore.google.com/detail/hjppipajfmgbkocbjejafmmdommjbnpg?utm_source=portfolio-quick-redirect',
                statusCode: 307,
            },
        ];
    },
    async headers() {
        return [
            {
                source: '/resume.pdf',
                headers: [
                    {
                        key: 'Content-Disposition',
                        value: 'inline; filename="MaiWu_Resume.pdf"',
                    },
                ],
            },
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                ],
            },
        ]
    },
};

export default nextConfig;
