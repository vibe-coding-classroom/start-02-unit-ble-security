/**
 * Start 02: Web BLE 安全機制與權限規範
 * 實作目標：
 * 1. 精準過濾 (Precision Filtering)
 * 2. 完善的例外處理 (Robust Error Handling)
 * 3. 使用者手勢觸發 (User Gesture Requirement)
 */

const connectBtn = document.getElementById('connect-btn');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const deviceCard = document.getElementById('device-card');
const deviceNameEl = document.getElementById('device-name');
const deviceIdEl = document.getElementById('device-id');
const errorDisplay = document.getElementById('error-display');

// 配置過濾器 (根據任務 2：精準過濾)
const bleOptions = {
    // 範例：過濾名稱開頭為 'Car-' 的設備
    // filters: [{ namePrefix: 'Car-' }], 
    
    // 或者過濾特定的 Service UUID (安全性更高)
    // filters: [{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }],
    
    // 若要顯示所有設備 (不建議，但在開發初期可用)
    acceptAllDevices: true, 
    
    // 即使 acceptAllDevices 為 true，若要讀寫 characteristic，仍需列出服務
    // optionalServices: ['battery_service', 'heart_rate']
};

/**
 * 更新 UI 狀態
 */
function updateStatus(state, message, isError = false) {
    statusText.textContent = message;
    errorDisplay.style.display = isError ? 'block' : 'none';
    if (isError) {
        errorDisplay.textContent = message;
        statusDot.className = 'dot';
        statusDot.style.background = '#ef4444';
    } else {
        statusDot.className = state === 'connected' ? 'dot active' : 'dot';
        if (state === 'idle') statusDot.style.background = '#475569';
    }
}

/**
 * 處理 BLE 連線
 */
async function requestBleDevice() {
    // 清除先前的錯誤
    updateStatus('idle', '正在請求設備...', false);
    deviceCard.classList.remove('active');

    try {
        // 任務 1：實施防禦性編程 (包裹 requestDevice)
        console.log('Requesting Bluetooth Device...');
        
        // 觸發瀏覽器配對視窗
        const device = await navigator.bluetooth.requestDevice(bleOptions);

        console.log('> Name: ' + device.name);
        console.log('> Id: ' + device.id);

        // 成功取得設備
        deviceNameEl.textContent = device.name || '未知設備';
        deviceIdEl.textContent = device.id;
        deviceCard.classList.add('active');
        updateStatus('connected', '已配對：' + (device.name || '未知設備'));

        // 監聽斷線事件 (自檢與自癒能力)
        device.addEventListener('gattserverdisconnected', onDisconnected);

    } catch (error) {
        // 任務 1：針對特定的錯誤類型給出「人類語言」提示
        handleBleError(error);
    }
}

/**
 * 錯誤處理邏輯 (Security & Robustness)
 */
function handleBleError(error) {
    let userFriendlyMsg = '';

    switch (error.name) {
        case 'NotFoundError':
            // 使用者在視窗中按下了「取消」
            userFriendlyMsg = '❌ 操作取消：請選擇一個設備以繼續連線。';
            break;
        case 'SecurityError':
            // 非使用者手勢觸發，或在不安全的 Context 下
            userFriendlyMsg = '⚠️ 安全錯誤：藍牙請求必須由使用者點擊觸發，且需在 HTTPS 環境。';
            break;
        case 'NotSupportedError':
            // 瀏覽器或平台不支援
            userFriendlyMsg = '🚫 不支援：此瀏覽器或作業系統不支援 Web Bluetooth。';
            break;
        case 'InvalidStateError':
            userFriendlyMsg = '⏳ 狀態錯誤：目前已有一個連線程序在進行中。';
            break;
        default:
            userFriendlyMsg = `🛑 發生意外錯誤：${error.message}`;
    }

    console.error('BLE Error:', error);
    updateStatus('error', userFriendlyMsg, true);
}

/**
 * 斷線處理
 */
function onDisconnected(event) {
    const device = event.target;
    console.log(`Device ${device.name} is disconnected.`);
    updateStatus('idle', '設備已斷開連線，請重新嘗試。', true);
    deviceCard.classList.remove('active');
}

// 綁定按鈕事件 (符合 User Gesture 限制)
connectBtn.addEventListener('click', requestBleDevice);
