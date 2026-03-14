const STORAGE_KEY = "yuanlu-mobile-state-v2";
const DEFAULT_BASE = "http://127.0.0.1:8000";

const state = {
  apiBase: DEFAULT_BASE,
  activeTab: "travel",
  travel_id: "",
  capsule_id: "",
  bottle_id: "",
  export_task_id: "",
};

const refs = {
  navItems: [...document.querySelectorAll(".nav-item")],
  tabPages: [...document.querySelectorAll(".tab-page")],
  toast: document.getElementById("toast"),
  apiBase: document.getElementById("apiBase"),
  stateTravelId: document.getElementById("stateTravelId"),
  stateCapsuleId: document.getElementById("stateCapsuleId"),
  stateBottleId: document.getElementById("stateBottleId"),
  profileTravelId: document.getElementById("profileTravelId"),
  profileCapsuleId: document.getElementById("profileCapsuleId"),
  profileBottleId: document.getElementById("profileBottleId"),
  serviceStatusText: document.getElementById("serviceStatusText"),
  serviceStatusMeta: document.getElementById("serviceStatusMeta"),
  travelFeed: document.getElementById("travelFeed"),
  capsuleFeed: document.getElementById("capsuleFeed"),
  bottleFeed: document.getElementById("bottleFeed"),
  communityFeed: document.getElementById("communityFeed"),
  profileFeed: document.getElementById("profileFeed"),
  travelOutput: document.getElementById("travelOutput"),
  capsuleOutput: document.getElementById("capsuleOutput"),
  bottleOutput: document.getElementById("bottleOutput"),
  communityOutput: document.getElementById("communityOutput"),
  profileOutput: document.getElementById("profileOutput"),
};

function boot() {
  restoreState();
  bindNavigation();
  bindGlowTracking();
  bindSheetButtons();
  bindMainActions();
  renderState();
  fetchServiceStatus();
}

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    Object.assign(state, saved);
  } catch (error) {
    console.warn("restore state failed", error);
  }
  if (!state.apiBase) {
    state.apiBase = DEFAULT_BASE;
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderState() {
  refs.apiBase.value = state.apiBase;
  const travel = readableValue(state.travel_id);
  const capsule = readableValue(state.capsule_id);
  const bottle = readableValue(state.bottle_id);
  refs.stateTravelId.textContent = travel;
  refs.stateCapsuleId.textContent = capsule;
  refs.stateBottleId.textContent = bottle;
  refs.profileTravelId.textContent = travel;
  refs.profileCapsuleId.textContent = capsule;
  refs.profileBottleId.textContent = bottle;

  document.querySelectorAll("[data-state-bind]").forEach((element) => {
    const key = element.dataset.stateBind;
    if (!key || document.activeElement === element) {
      return;
    }
    element.value = state[key] || "";
  });

  switchTab(state.activeTab || "travel", false);
}

function readableValue(value) {
  return value ? String(value) : "未设置";
}

function switchTab(tab, shouldPersist = true) {
  state.activeTab = tab;
  refs.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.tabTarget === tab);
  });
  refs.tabPages.forEach((page) => {
    page.classList.toggle("active", page.dataset.tab === tab);
  });
  if (shouldPersist) {
    persistState();
  }
}

function bindNavigation() {
  refs.navItems.forEach((item) => {
    item.addEventListener("click", () => switchTab(item.dataset.tabTarget));
  });

  document.getElementById("saveBaseBtn").addEventListener("click", () => {
    const next = refs.apiBase.value.trim().replace(/\/$/, "");
    if (!next) {
      showToast("请输入后端地址");
      return;
    }
    state.apiBase = next;
    persistState();
    showToast("后端地址已保存");
    fetchServiceStatus();
  });

  document.getElementById("refreshServiceBtn").addEventListener("click", fetchServiceStatus);
}

function bindGlowTracking() {
  document.querySelectorAll(".glow-track, .pulse-btn, .soft-btn, .nav-item").forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      element.style.setProperty("--mx", `${x}%`);
      element.style.setProperty("--my", `${y}%`);
    });
  });
}

function bindSheetButtons() {
  document.querySelectorAll("[data-open-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      const details = document.getElementById(button.dataset.openSheet);
      if (!details) return;
      details.open = true;
      details.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function bindMainActions() {
  document.getElementById("loadAnchorsBtn").addEventListener("click", loadAnchors);
  document.getElementById("loadDiaryBtn").addEventListener("click", loadDiary);
  document.getElementById("loadBottleTrackBtn").addEventListener("click", loadBottleTrajectory);
  document.getElementById("communityHealthBtn").addEventListener("click", loadCommunityHealth);

  bindJsonForm("travelStartForm", async (payload) => {
    const res = await requestJson("/travel/start", { method: "POST", body: payload });
    if (res.travel_id) {
      state.travel_id = String(res.travel_id);
      persistState();
      renderState();
      prependFeed(refs.travelFeed, {
        title: `旅行 #${res.travel_id}`,
        text: "已创建新的旅行会话，接下来可继续上传位置和锚点。",
        tone: "user",
      });
    }
    writeOutput(refs.travelOutput, res);
    showToast("旅行已开始");
  });

  bindJsonForm("travelLocationForm", async (payload) => {
    payload.timestamp = normalizeDateTime(payload.timestamp);
    const res = await requestJson("/travel/location", { method: "POST", body: payload });
    prependFeed(refs.travelFeed, {
      title: res.anchor_triggered ? "自动锚点触发" : "位置已上传",
      text: res.anchor_triggered ? "后端判定满足条件，旅行感知 Agent 已被触发。" : "位置点已纳入轨迹。",
      tone: "ai",
    });
    writeOutput(refs.travelOutput, res);
    showToast(res.anchor_triggered ? "已触发自动锚点" : "位置已上传");
  });

  bindJsonForm("travelAnchorForm", async (payload) => {
    const res = await requestJson("/travel/anchor/manual", { method: "POST", body: payload });
    prependFeed(refs.travelFeed, {
      title: `手动锚点 #${res.anchor_id}`,
      text: "已记录一段需要被保留的瞬间。",
      tone: "user",
    });
    writeOutput(refs.travelOutput, res);
    showToast("手动锚点已创建");
  });

  bindJsonForm("travelEndForm", async (payload) => {
    const res = await requestJson("/travel/end", { method: "POST", body: payload });
    prependFeed(refs.travelFeed, {
      title: "旅行已结束",
      text: "内容生成 Agent 已开始整理你的旅记。",
      tone: "rag",
    });
    writeOutput(refs.travelOutput, res);
    showToast("已结束旅行");
  });

  bindJsonForm("capsuleCreateForm", async (payload) => {
    payload.time_lock_until = normalizeDateTime(payload.time_lock_until);
    const res = await requestJson("/capsule/create", { method: "POST", body: payload });
    if (res.capsule_id) {
      state.capsule_id = String(res.capsule_id);
      persistState();
      renderState();
      prependFeed(refs.capsuleFeed, {
        title: `胶囊 #${res.capsule_id}`,
        text: "一枚新的时空胶囊已经被埋下。",
        tone: "rag",
      });
    }
    writeOutput(refs.capsuleOutput, res);
    showToast("胶囊已创建");
  });

  bindQueryForm("capsuleNearbyForm", async (payload) => {
    const query = new URLSearchParams(payload).toString();
    const res = await requestJson(`/capsule/nearby?${query}`);
    renderFeed(refs.capsuleFeed, (res.items || []).map((item) => ({
      title: `胶囊 #${item.id}`,
      text: `${item.city || "未知城市"} · ${item.distance_m}m · ${item.status}`,
      tone: "ai",
    })));
    if (res.items?.[0]?.id) {
      state.capsule_id = String(res.items[0].id);
      persistState();
      renderState();
    }
    writeOutput(refs.capsuleOutput, res);
    showToast(`找到 ${(res.items || []).length} 个胶囊`);
  });

  bindJsonForm("capsuleVerifyForm", async (payload) => {
    const res = await requestJson("/capsule/verify", { method: "POST", body: payload });
    prependFeed(refs.capsuleFeed, {
      title: `钥判定：${res.result}`,
      text: res.poetic_line || res.message || "已完成语义判定。",
      tone: res.result === "pass" ? "rag" : "ai",
    });
    writeOutput(refs.capsuleOutput, res);
    showToast(`判定结果：${res.result}`);
  });

  bindJsonForm("capsuleEchoForm", async (payload) => {
    const res = await requestJson("/capsule/echo", { method: "POST", body: payload });
    prependFeed(refs.capsuleFeed, {
      title: `回响 #${res.echo_id}`,
      text: "这段回声已被写入胶囊。",
      tone: "user",
    });
    writeOutput(refs.capsuleOutput, res);
    showToast("回响已写入");
  });

  bindJsonForm("bottleThrowForm", async (payload) => {
    const res = await requestJson("/bottle/throw", { method: "POST", body: payload });
    if (res.bottle_id) {
      state.bottle_id = String(res.bottle_id);
      persistState();
      renderState();
      prependFeed(refs.bottleFeed, {
        title: `远洋瓶 #${res.bottle_id}`,
        text: "一只瓶子被投入海面，等待被远方接住。",
        tone: "ai",
      });
    }
    writeOutput(refs.bottleOutput, res);
    showToast(res.bottle_id ? "远洋瓶已扔出" : "当前地点不能投放");
  });

  bindJsonForm("bottleReceiveForm", async (payload) => {
    const res = await requestJson("/bottle/receive", { method: "POST", body: payload });
    if (res.bottle_id) {
      state.bottle_id = String(res.bottle_id);
      persistState();
      renderState();
      prependFeed(refs.bottleFeed, {
        title: `收到漂流瓶 #${res.bottle_id}`,
        text: res.content || "你收到了一句来自远方的话。",
        tone: "user",
      });
    }
    writeOutput(refs.bottleOutput, res);
    showToast(res.received ? "收到一只漂流瓶" : "这次没有收到漂流瓶");
  });

  bindQueryForm("notificationsForm", async (payload) => {
    const res = await requestJson(`/notifications/unread?${new URLSearchParams(payload).toString()}`);
    renderFeed(refs.communityFeed, (res.items || []).map((item) => ({
      title: `${item.type} · 通知 #${item.id}`,
      text: item.content || "通知内容为空",
      tone: "rag",
    })));
    writeOutput(refs.communityOutput, res);
    showToast(`读取到 ${(res.items || []).length} 条通知`);
  });

  bindJsonForm("exportMapForm", async (payload) => {
    const res = await requestJson("/export/map", { method: "POST", body: payload });
    syncExportTask(res.task_id, "地图导出任务已创建");
    writeOutput(refs.profileOutput, res);
  });

  bindJsonForm("exportNotebookForm", async (payload) => {
    const res = await requestJson("/export/notebook", { method: "POST", body: payload });
    syncExportTask(res.task_id, "手账导出任务已创建");
    writeOutput(refs.profileOutput, res);
  });

  bindVirtualForm("exportStatusForm", async (payload) => {
    const res = await requestJson(`/export/status/${encodeURIComponent(payload.task_id)}`);
    prependFeed(refs.profileFeed, {
      title: `导出任务：${res.status}`,
      text: res.result_url || res.error || "任务处理中。",
      tone: res.status === "done" ? "ai" : "user",
    });
    writeOutput(refs.profileOutput, res);
    showToast(res.result_url ? "导出结果已就绪" : `任务状态：${res.status}`);
  });
}

function bindJsonForm(formId, handler) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = getFormPayload(form);
    try {
      await handler(payload);
    } catch (error) {
      handleError(error, detectOutput(formId));
    }
  });
}

function bindQueryForm(formId, handler) {
  bindJsonForm(formId, handler);
}

function bindVirtualForm(formId, handler) {
  bindJsonForm(formId, handler);
}

function detectOutput(formId) {
  if (formId.startsWith("travel")) return refs.travelOutput;
  if (formId.startsWith("capsule")) return refs.capsuleOutput;
  if (formId.startsWith("bottle")) return refs.bottleOutput;
  if (formId.startsWith("notification")) return refs.communityOutput;
  return refs.profileOutput;
}

function getFormPayload(form) {
  const formData = new FormData(form);
  const payload = {};
  for (const [key, value] of formData.entries()) {
    const trimmed = typeof value === "string" ? value.trim() : value;
    if (trimmed === "") continue;
    const field = form.elements.namedItem(key);
    payload[key] = field && field.type === "number" ? Number(trimmed) : trimmed;
  }
  return payload;
}

function normalizeDateTime(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

async function requestJson(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const url = path.startsWith("http") ? path : `${state.apiBase}${path}`;
  const requestOptions = {
    method: options.method || "GET",
    headers: { Accept: "application/json" },
    signal: controller.signal,
  };
  if (options.body) {
    requestOptions.headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, requestOptions);
    const text = await response.text();
    const data = text ? safeJsonParse(text) : {};
    if (!response.ok) {
      throw new Error(extractMessage(data, response.status));
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function extractMessage(data, status) {
  if (data && typeof data === "object") {
    if (typeof data.detail === "string") return `[${status}] ${data.detail}`;
    if (typeof data.error === "string") return `[${status}] ${data.error}`;
  }
  return `[${status}] 请求失败`;
}

function writeOutput(target, payload) {
  target.textContent = JSON.stringify(payload, null, 2);
}

function renderFeed(target, items) {
  target.innerHTML = "";
  if (!items.length) {
    prependFeed(target, { title: "暂无数据", text: "接口当前没有返回内容。", tone: "user" });
    return;
  }
  items.forEach((item) => appendFeed(target, item));
}

function appendFeed(target, item) {
  const card = buildFeedCard(item);
  target.appendChild(card);
}

function prependFeed(target, item) {
  const card = buildFeedCard(item);
  if (target.firstChild) target.insertBefore(card, target.firstChild);
  else target.appendChild(card);
}

function buildFeedCard(item) {
  const card = document.createElement("article");
  card.className = `feed-card ${item.tone || "user"}`;
  card.innerHTML = `<strong>${escapeHtml(item.title || "")}</strong><p>${escapeHtml(item.text || "")}</p>`;
  return card;
}

function handleError(error, target) {
  const message = error.name === "AbortError" ? "请求超时，请检查后端服务" : error.message;
  writeOutput(target, { error: message });
  showToast(message);
}

async function fetchServiceStatus() {
  try {
    const res = await requestJson("/");
    refs.serviceStatusText.textContent = res.service || "在线";
    refs.serviceStatusMeta.textContent = `${res.env || "unknown"} · ${res.message || "服务已响应"}`;
    showToast("服务连接成功");
  } catch (error) {
    refs.serviceStatusText.textContent = "未连接";
    refs.serviceStatusMeta.textContent = error.message;
    showToast(error.message);
  }
}

async function loadAnchors() {
  if (!state.travel_id) {
    showToast("请先开始旅行");
    return;
  }
  try {
    const res = await requestJson(`/travel/${state.travel_id}/anchors`);
    renderFeed(refs.travelFeed, (res.items || []).map((item) => ({
      title: `${item.poi_name || "未命名锚点"} #${item.id}`,
      text: [item.motion_type, item.weather, item.user_text].filter(Boolean).join(" · ") || "暂无补充信息",
      tone: item.user_text ? "user" : "ai",
    })));
    writeOutput(refs.travelOutput, res);
    showToast(`读取到 ${(res.items || []).length} 个锚点`);
  } catch (error) {
    handleError(error, refs.travelOutput);
  }
}

async function loadDiary() {
  if (!state.travel_id) {
    showToast("请先开始旅行");
    return;
  }
  try {
    const res = await requestJson(`/travel/${state.travel_id}/diary`);
    if (res.status === "ready" && Array.isArray(res.content_json?.segments)) {
      renderFeed(refs.travelFeed, res.content_json.segments.map((seg) => ({
        title: String(seg.source || "ai").toUpperCase(),
        text: seg.text || "",
        tone: seg.source || "ai",
      })));
    }
    writeOutput(refs.travelOutput, res);
    showToast(res.status === "ready" ? "旅记已准备好" : "旅记仍在生成中");
  } catch (error) {
    handleError(error, refs.travelOutput);
  }
}

async function loadBottleTrajectory() {
  if (!state.bottle_id) {
    showToast("当前没有漂流瓶 ID");
    return;
  }
  try {
    const res = await requestJson(`/bottle/trajectory/${state.bottle_id}`);
    prependFeed(refs.bottleFeed, {
      title: `轨迹状态：${res.status}`,
      text: `${formatLocation(res.from)} → ${formatLocation(res.to)}`,
      tone: "ai",
    });
    writeOutput(refs.bottleOutput, res);
    showToast("已读取漂流轨迹");
  } catch (error) {
    handleError(error, refs.bottleOutput);
  }
}

async function loadCommunityHealth() {
  try {
    const res = await requestJson("/community/health");
    prependFeed(refs.communityFeed, {
      title: "社区服务",
      text: `当前状态：${res.status || "unknown"}`,
      tone: "ai",
    });
    writeOutput(refs.communityOutput, res);
    showToast("社区服务可访问");
  } catch (error) {
    handleError(error, refs.communityOutput);
  }
}

function syncExportTask(taskId, message) {
  if (taskId) {
    state.export_task_id = String(taskId);
    persistState();
    renderState();
    prependFeed(refs.profileFeed, {
      title: "导出任务已创建",
      text: `任务 ID: ${taskId}`,
      tone: "ai",
    });
  }
  showToast(message);
}

function formatLocation(value) {
  if (!value) return "未知";
  const city = value.city || "未知城市";
  const lat = value.lat ?? "-";
  const lng = value.lng ?? "-";
  return `${city} (${lat}, ${lng})`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

let toastTimer = null;
function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => refs.toast.classList.remove("visible"), 2200);
}

boot();
