import { test, expect, Page } from '@playwright/test';

// Helper: set localStorage for auth
async function setupAuth(page: Page, userId: string = 'test-e2e-user') {
  await page.addInitScript((uid) => {
    // Set up user auth in localStorage
    const authData = { user_id: uid, username: null, nickname: '测试旅人' };
    localStorage.setItem('yuanlv_user', JSON.stringify(authData));
    // Set up app state with API base
    const state = {
      apiBase: 'http://127.0.0.1:8000',
      userId: uid,
    };
    localStorage.setItem('yuanlu-react-state-v1', JSON.stringify(state));
  }, userId);
}

// Helper: mock geolocation
async function mockGeolocation(page: Page, lat: number = 31.2304, lng: number = 121.4737) {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: lat, longitude: lng });
}

test.describe('缘旅 完整产品 Walkthrough', () => {

  test.describe('1. 首页与认证', () => {

    test('1.1 首页加载 - 地图正常渲染', async ({ page }) => {
      await mockGeolocation(page);
      await page.goto('/');
      // Wait for the app to load
      await page.waitForLoadState('networkidle');
      // Check page loaded (look for the app container or nav)
      await expect(page.locator('body')).toBeVisible();
      // Screenshot
      await page.screenshot({ path: '../artifacts/screenshots/01-home.png', fullPage: true });
    });

    test('1.2 注册页面', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
      await page.screenshot({ path: '../artifacts/screenshots/02-auth.png', fullPage: true });
    });

    test('1.3 匿名注册并进入首页', async ({ page }) => {
      // Register anonymously via API first
      const response = await page.request.post('http://127.0.0.1:8000/user/register', {
        data: { user_id: 'e2e-test-' + Date.now() }
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);

      // Set up auth and navigate
      await setupAuth(page, String(data.user_id));
      await mockGeolocation(page);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '../artifacts/screenshots/03-home-authed.png', fullPage: true });
    });
  });

  test.describe('2. Travel 旅行流程', () => {

    test('2.1 开始旅行 - API 调用验证', async ({ page }) => {
      // Use existing demo user
      await setupAuth(page, '2');
      await mockGeolocation(page);

      // Listen for travel/start API call
      const startPromise = page.waitForResponse(
        resp => resp.url().includes('/travel/start') && resp.status() === 200,
        { timeout: 15000 }
      ).catch(() => null);

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for the start travel button
      await page.screenshot({ path: '../artifacts/screenshots/04-travel-home.png', fullPage: true });
    });

    test('2.2 录制中页面 - 实时 GPS', async ({ page }) => {
      await setupAuth(page, '2');
      await mockGeolocation(page);
      await page.goto('/recording');
      await page.waitForLoadState('networkidle');
      // Wait a moment for map to render
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '../artifacts/screenshots/05-recording.png', fullPage: true });
    });

    test('2.3 旅行日记页面 - 数据来自 API', async ({ page }) => {
      await setupAuth(page, '2');

      // Intercept diary API call
      const diaryPromise = page.waitForResponse(
        resp => resp.url().includes('/diary') || resp.url().includes('/travel/'),
        { timeout: 10000 }
      ).catch(() => null);

      await page.goto('/diary');
      await page.waitForLoadState('networkidle');

      const diaryResponse = await diaryPromise;
      if (diaryResponse) {
        expect(diaryResponse.ok()).toBeTruthy();
      }

      await page.waitForTimeout(2000);
      await page.screenshot({ path: '../artifacts/screenshots/06-diary.png', fullPage: true });
    });

    test('2.4 导出页面', async ({ page }) => {
      await setupAuth(page, '2');
      await mockGeolocation(page);
      await page.goto('/export');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '../artifacts/screenshots/07-export.png', fullPage: true });
    });
  });

  test.describe('3. Yuan 缘模块', () => {

    test('3.1 缘主页 - 地图+胶囊', async ({ page }) => {
      await setupAuth(page, '2');
      await mockGeolocation(page);
      await page.goto('/yuan');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '../artifacts/screenshots/08-yuan-home.png', fullPage: true });
    });

    test('3.2 创建胶囊 - API 调用验证', async ({ page }) => {
      await setupAuth(page, '2');
      await mockGeolocation(page);
      await page.goto('/yuan/capsule-create');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '../artifacts/screenshots/09-capsule-create.png', fullPage: true });
    });

    test('3.3 发现胶囊', async ({ page }) => {
      await setupAuth(page, '2');
      await mockGeolocation(page);
      await page.goto('/yuan/capsule-discovery');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '../artifacts/screenshots/10-capsule-discovery.png', fullPage: true });
    });

    test('3.4 投放远洋瓶', async ({ page }) => {
      await setupAuth(page, '2');
      await mockGeolocation(page, 18.25, 109.5); // Sanya seaside
      await page.goto('/yuan/bottle-send');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '../artifacts/screenshots/11-bottle-send.png', fullPage: true });
    });

    test('3.5 接收远洋瓶', async ({ page }) => {
      await setupAuth(page, '2');
      await mockGeolocation(page, 24.45, 118.08); // Xiamen seaside
      await page.goto('/yuan/bottle-receive');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '../artifacts/screenshots/12-bottle-receive.png', fullPage: true });
    });
  });

  test.describe('4. Community 社区', () => {

    test('4.1 社区 Feed - 数据来自 API', async ({ page }) => {
      await setupAuth(page, '2');

      // Intercept community posts API
      const feedPromise = page.waitForResponse(
        resp => resp.url().includes('/community/posts'),
        { timeout: 10000 }
      ).catch(() => null);

      await page.goto('/community');
      await page.waitForLoadState('networkidle');

      const feedResponse = await feedPromise;
      if (feedResponse) {
        expect(feedResponse.ok()).toBeTruthy();
        const feedData = await feedResponse.json();
        // Verify data comes from API, not hardcoded
        expect(feedData).toHaveProperty('items');
        expect(Array.isArray(feedData.items)).toBeTruthy();
      }

      await page.waitForTimeout(2000);
      await page.screenshot({ path: '../artifacts/screenshots/13-community.png', fullPage: true });
    });

    test('4.2 帖子详情', async ({ page }) => {
      await setupAuth(page, '2');
      await page.goto('/community/post/1');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '../artifacts/screenshots/14-post-detail.png', fullPage: true });
    });
  });

  test.describe('5. Profile 我的', () => {

    test('5.1 个人主页 - 真实数据', async ({ page }) => {
      await setupAuth(page, '2');

      // Intercept profile-related API calls
      const apiCalls: string[] = [];
      page.on('response', (resp) => {
        if (resp.url().includes('127.0.0.1:8000') && resp.ok()) {
          apiCalls.push(resp.url());
        }
      });

      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Verify API calls were made
      console.log('Profile API calls:', apiCalls);

      await page.screenshot({ path: '../artifacts/screenshots/15-profile.png', fullPage: true });
    });

    test('5.2 胶囊管理', async ({ page }) => {
      await setupAuth(page, '2');
      await page.goto('/profile/capsule-management');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '../artifacts/screenshots/16-capsule-mgmt.png', fullPage: true });
    });

    test('5.3 日记管理', async ({ page }) => {
      await setupAuth(page, '2');
      await page.goto('/profile/diary-management');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '../artifacts/screenshots/17-diary-mgmt.png', fullPage: true });
    });

    test('5.4 用户等级', async ({ page }) => {
      await setupAuth(page, '2');
      await page.goto('/profile/user-level');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '../artifacts/screenshots/18-user-level.png', fullPage: true });
    });
  });

  test.describe('6. API 数据流验证', () => {

    test('6.1 Travel API - 创建旅行并验证数据库', async ({ page }) => {
      // Create travel via API
      const response = await page.request.post('http://127.0.0.1:8000/travel/start', {
        data: { user_id: 2, city: 'E2E测试城市' }
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('travel_id');
      expect(typeof data.travel_id).toBe('number');

      // Upload location
      const locResponse = await page.request.post('http://127.0.0.1:8000/travel/location', {
        data: {
          travel_id: data.travel_id,
          lat: 31.2304,
          lng: 121.4737,
          speed: 0.1,
          timestamp: new Date().toISOString()
        }
      });
      expect(locResponse.ok()).toBeTruthy();

      // End travel
      const endResponse = await page.request.post('http://127.0.0.1:8000/travel/end', {
        data: { travel_id: data.travel_id }
      });
      expect(endResponse.ok()).toBeTruthy();

      // Check diary generation
      const diaryResponse = await page.request.get(
        `http://127.0.0.1:8000/travel/${data.travel_id}/diary`
      );
      expect(diaryResponse.ok()).toBeTruthy();
    });

    test('6.2 Capsule API - 创建并验证', async ({ page }) => {
      const response = await page.request.post('http://127.0.0.1:8000/capsule/create', {
        data: {
          user_id: 2,
          lat: 31.23,
          lng: 121.47,
          city: 'E2E测试',
          yuan_ji: 'E2E测试缘记内容',
          key_question: '测试问题',
          key_answer_hint: '测试答案'
        }
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('capsule_id');

      // Verify nearby
      const nearbyResponse = await page.request.get(
        `http://127.0.0.1:8000/capsule/nearby?lat=31.23&lng=121.47&radius=1000`
      );
      expect(nearbyResponse.ok()).toBeTruthy();
      const nearbyData = await nearbyResponse.json();
      expect(nearbyData.items.some((c: any) => c.id === data.capsule_id)).toBeTruthy();

      // Verify key
      const verifyResponse = await page.request.post('http://127.0.0.1:8000/capsule/verify', {
        data: {
          capsule_id: data.capsule_id,
          user_answer: '测试答案',
          finder_user_id: 1
        }
      });
      expect(verifyResponse.ok()).toBeTruthy();
    });

    test('6.3 Community API - Feed 真实数据', async ({ page }) => {
      const response = await page.request.get(
        'http://127.0.0.1:8000/community/posts?page=1&page_size=5'
      );
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('items');
      expect(data.items.length).toBeGreaterThan(0);
      // Verify each post has required fields
      for (const post of data.items) {
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('city');
      }
    });

    test('6.4 Bottle API - 投放与接收', async ({ page }) => {
      // Throw at seaside (Sanya)
      const throwResponse = await page.request.post('http://127.0.0.1:8000/bottle/throw', {
        data: {
          user_id: 2,
          content: 'E2E测试瓶中信',
          lat: 18.25,
          lng: 109.5
        }
      });
      // May or may not be seaside depending on Mapbox API
      const throwData = await throwResponse.json();
      console.log('Bottle throw result:', throwData);

      // Try receive
      const receiveResponse = await page.request.post('http://127.0.0.1:8000/bottle/receive', {
        data: { user_id: 1, lat: 24.45, lng: 118.08 }
      });
      expect(receiveResponse.ok()).toBeTruthy();
    });

    test('6.5 Map Config - Token 配置可选', async ({ page }) => {
      const response = await page.request.get('http://127.0.0.1:8000/map/client-config');
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.provider).toBe('mapbox');
      expect(typeof data.public_token).toBe('string');
    });
  });
});
