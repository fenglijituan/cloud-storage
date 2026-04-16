// Cloudflare Worker for WeChat Official Account Crawling
// 部署到Cloudflare Workers后，前端可以通过此API获取公众号信息

export default {
  async fetch(request, env, ctx) {
    // 设置CORS头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理OPTIONS请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 只允许GET请求
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    try {
      // 从KV存储获取缓存数据
      const cacheKey = 'wechat_articles_cache';
      let cachedData = await env.WECHAT_KV.get(cacheKey, { type: 'json' });
      
      // 如果缓存存在且未过期（5分钟缓存）
      if (cachedData && Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
        return new Response(JSON.stringify({
          success: true,
          data: cachedData.data,
          cached: true,
          timestamp: cachedData.timestamp
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 真实爬取逻辑（需要替换为实际的爬取代码）
      const articles = await fetchWechatArticles();
      
      // 存储到KV
      const cacheData = {
        data: articles,
        timestamp: Date.now()
      };
      await env.WECHAT_KV.put(cacheKey, JSON.stringify(cacheData));

      return new Response(JSON.stringify({
        success: true,
        data: articles,
        cached: false,
        timestamp: Date.now()
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      
      // 返回错误信息
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: Date.now()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  },
};

// 公众号爬取函数（需要根据实际情况实现）
async function fetchWechatArticles() {
  // 这里需要实现真实的公众号爬取逻辑
  // 由于微信公众号有严格的反爬机制，建议使用以下方法之一：
  // 1. 使用微信公众号开放API（如果有权限）
  // 2. 使用第三方服务
  // 3. 使用无头浏览器（如Puppeteer）
  
  // 示例：模拟数据
  return [
    {
      title: "善水文化主题艺术节圆满落幕，学生作品惊艳亮相",
      cover: "https://raw.githubusercontent.com/fenglijituan/cloud-storage/main/勿删网页/640.webp",
      date: "2026-04-15",
      url: "https://mp.weixin.qq.com/s/example1"
    },
    {
      title: "浑南八小篮球队再创佳绩，勇夺区小学生篮球联赛冠军",
      cover: "https://raw.githubusercontent.com/fenglijituan/cloud-storage/main/勿删网页/640%20(1).webp",
      date: "2026-04-08",
      url: "https://mp.weixin.qq.com/s/example2"
    },
    {
      title: "全国健康学校建设专家组莅临我校调研指导工作",
      cover: "https://raw.githubusercontent.com/fenglijituan/cloud-storage/main/勿删网页/640%20(2).webp",
      date: "2026-04-01",
      url: "https://mp.weixin.qq.com/s/example3"
    },
    {
      title: "善水课程体系获评辽宁省精品校本课程",
      cover: "https://raw.githubusercontent.com/fenglijituan/cloud-storage/main/勿删网页/640%20(3).webp",
      date: "2026-03-25",
      url: "https://mp.weixin.qq.com/s/example4"
    }
  ];
}

// 使用Puppeteer的示例（需要安装wrangler的puppeteer支持）
/*
async function fetchWechatArticlesWithPuppeteer() {
  // 注意：这需要在Cloudflare Workers的Durable Objects中运行
  // 或者使用专门的浏览器服务
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('https://mp.weixin.qq.com/s/公众号主页URL');
    
    // 等待页面加载
    await page.waitForSelector('.article-item');
    
    const articles = await page.evaluate(() => {
      const items = document.querySelectorAll('.article-item');
      return Array.from(items).map(item => ({
        title: item.querySelector('.article-title').textContent,
        cover: item.querySelector('.article-cover img').src,
        date: item.querySelector('.article-date').textContent,
        url: item.href
      }));
    });
    
    await browser.close();
    return articles;
  } catch (error) {
    await browser.close();
    throw error;
  }
}
*/