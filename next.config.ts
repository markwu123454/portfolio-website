import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
