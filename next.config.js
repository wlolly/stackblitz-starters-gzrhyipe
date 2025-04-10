/**
 * !!! Next.js配置规范警告 !!!
 * 本文件定义了Next.js项目配置，必须遵循以下规则：
 * 1. 环境变量必须使用env配置正确暴露
 * 2. 路由重写和重定向必须明确记录用途
 * 3. 自定义webpack配置必须仅用于必要场景
 * 4. API路由必须正确配置CORS和安全策略
 * 5. 跨域资源和外部服务必须在配置中明确声明
 * 
 * 违反以上规则可能导致构建错误、安全漏洞和性能问题
 */

import path from 'path';
import { fileURLToPath } from 'url';

// 在 ES 模块中获取 __dirname 等效方法
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      enabled: true
    },
    optimizePackageImports: ['@/app/components'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  webpack: (config, { dev }) => {
    config.externals = [...config.externals, { canvas: "canvas" }];  
    
    // 添加路径别名
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './app/components'),
      '@/app': path.resolve(__dirname, './app'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/shared': path.resolve(__dirname, './shared'),
      '@/utils': path.resolve(__dirname, './utils'),
    };
    
    // 内存优化 - 优化配置，避免开发模式中的冲突
    if (dev) {
      // 仅应用开发环境友好的优化选项
      config.optimization = {
        ...config.optimization,
        mergeDuplicateChunks: true,
        runtimeChunk: { name: 'runtime' },
        // 在开发模式下使用更保守的分块策略
        splitChunks: {
          chunks: 'async', // 仅异步chunks
          minSize: 30000,
          maxSize: 250000,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    } else {
      // 生产环境使用更积极的优化
      config.optimization = {
        ...config.optimization,
        minimize: true,
        mergeDuplicateChunks: true,
        runtimeChunk: { name: 'runtime' },
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          maxSize: 200000,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    // 缓存设置优化
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        maxAge: 31536000000, // 1 年，以毫秒为单位
      };
    }
    
    return config;
  },
  // 设置路径别名和重定向
  async rewrites() {
    return {
      beforeFiles: [
        // 处理不存在的页面，重定向到首页
        {
          source: '/:path*',
          destination: '/',
          has: [
            {
              type: 'header',
              key: 'x-redirected',
              value: 'true',
            },
          ],
        },
        // 应急页面路由直接访问
        {
          source: '/emergency-direct',
          destination: '/emergency-access/emergency'
        }
      ],
      fallback: [],
    }
  },
  
  // 重定向配置
  async redirects() {
    return [
      // 紧急工具重定向到新的独立路由组
      {
        source: '/emergency',
        destination: '/emergency-access/emergency',
        permanent: false
      },
      {
        source: '/emergency-tool',
        destination: '/emergency-access/emergency',
        permanent: false
      }
    ]
  },
  
  // 自定义页面扩展，将emergency目录设为单独路由组
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // 允许开发环境跨域请求
  allowedDevOrigins: [
    '02747779-55b8-4c50-aad4-a7eafbc2972b-00-1nc7izsvdz475.worf.replit.dev'
  ],
  
  // 服务器配置
  serverRuntimeConfig: {
    port: process.env.PORT || 5000,
    backupPort: process.env.SECONDARY_PORT || 3003,
    host: process.env.HOST || '0.0.0.0',
  },
  
  // 环境变量配置，设置默认端口为5000（映射到外部80端口）
  env: {
    PORT: process.env.PORT || '5000',
    SECONDARY_PORT: process.env.SECONDARY_PORT || '3003',
    HOST: process.env.HOST || '0.0.0.0',
    MAIN_PORT_MAPPING: '80',
    SECONDARY_PORT_MAPPING: '3000'
  },
  
  // 安全相关的HTTP头
  headers: async () => {
    return [
      {
        // 为所有路由添加安全头
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};

export default nextConfig;