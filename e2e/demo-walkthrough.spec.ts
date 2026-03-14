import { test, expect, Page } from '@playwright/test';

// This test produces the final demo walkthrough video
// Running with: npx playwright test e2e/demo-walkthrough.spec.ts

async function setupDemoUser(page: Page) {
  await page.addInitScript(() => {
    // Use existing demo user (id=2, 旅行者小缘)
    const authData = { user_id: '2', username: 'demo', nickname: '旅行者小缘' };
    localStorage.setItem('yuanlv_user', JSON.stringify(authData));
    const state = {
      apiBase: 'http://127.0.0.1:8000',
      userId: '2',
    };
    localStorage.setItem('yuanlu-react-state-v1', JSON.stringify(state));
  });
  // Grant geolocation permission and set to Shanghai
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 31.2304, longitude: 121.4737 });
}

test.use({
  video: { mode: 'on', size: { width: 390, height: 844 } },
  viewport: { width: 390, height: 844 },
});

test.describe('Demo Walkthrough - 完整产品演示', () => {
  test('完整产品 Walkthrough 录制', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes

    await setupDemoUser(page);

    // ========== 1. 首页地图 ==========
    console.log('>>> 1. 首页地图');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000); // Wait for map to render
    await page.screenshot({ path: '../artifacts/screenshots/demo-01-home.png' });

    // ========== 2. 查看录制中页面 ==========
    console.log('>>> 2. 录制中');
    await page.goto('/recording');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-02-recording.png' });

    // ========== 3. 旅行日记 ==========
    console.log('>>> 3. 旅行日记');
    await page.goto('/diary');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-03-diary.png' });

    // Scroll down to see more content
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '../artifacts/screenshots/demo-03b-diary-scroll.png' });

    // ========== 4. 导出页面 ==========
    console.log('>>> 4. 导出');
    await page.goto('/export');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-04-export.png' });

    // ========== 5. 缘主页 ==========
    console.log('>>> 5. 缘主页');
    await page.goto('/yuan');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-05-yuan.png' });

    // ========== 6. 创建胶囊 ==========
    console.log('>>> 6. 创建胶囊');
    await page.goto('/yuan/capsule-create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-06-capsule-create.png' });

    // ========== 7. 发现胶囊 ==========
    console.log('>>> 7. 发现胶囊');
    await page.goto('/yuan/capsule-discovery');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-07-capsule-discovery.png' });

    // ========== 8. 远洋瓶投放 ==========
    console.log('>>> 8. 远洋瓶投放');
    await page.goto('/yuan/bottle-send');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-08-bottle-send.png' });

    // ========== 9. 远洋瓶接收 ==========
    console.log('>>> 9. 远洋瓶接收');
    await page.goto('/yuan/bottle-receive');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-09-bottle-receive.png' });

    // ========== 10. 社区首页 ==========
    console.log('>>> 10. 社区');
    await page.goto('/community');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-10-community.png' });

    // Scroll feed
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(1500);

    // ========== 11. 帖子详情 ==========
    console.log('>>> 11. 帖子详情');
    await page.goto('/community/post/18');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-11-post-detail.png' });

    // ========== 12. 个人主页 ==========
    console.log('>>> 12. 个人主页');
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-12-profile.png' });

    // ========== 13. 胶囊管理 ==========
    console.log('>>> 13. 胶囊管理');
    await page.goto('/profile/capsule-management');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-13-capsule-mgmt.png' });

    // ========== 14. 日记管理 ==========
    console.log('>>> 14. 日记管理');
    await page.goto('/profile/diary-management');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-14-diary-mgmt.png' });

    // ========== 15. 用户等级 ==========
    console.log('>>> 15. 用户等级');
    await page.goto('/profile/user-level');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '../artifacts/screenshots/demo-15-user-level.png' });

    console.log('>>> 录制完成！');
  });
});
