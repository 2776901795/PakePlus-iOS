
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

document.addEventListener('click', hookClick, { capture: true })

// ===========================================
// 以下为新增版本显示和检查功能，不影响原有脚本功能
// ===========================================

// 当前版本信息配置
const currentVersion = {
  version: "1.0.2", // 当前APP版本号
  buildDate: new Date().toISOString().split('T')[0]
};

// 在页面加载完成后执行的函数
function initCustomFeatures() {
  // 1. 显示版本信息
  showVersionInfo();
  
  // 2. 检查新版本
  checkForUpdates();
  
  // 3. 隐藏APP下载相关元素
  hideAppDownloadElements();
}

// 显示版本信息函数
function showVersionInfo() {
  // 创建版本信息元素
  const versionElement = document.createElement('div');
  versionElement.className = 'version-info';
  versionElement.id = 'app-version-info';
  versionElement.style.cssText = 'font-size:0.7rem;color:#999;text-align:center;margin-top:5px;padding-bottom:5px;';
  
  // 设置版本信息内容
  versionElement.textContent = `v${currentVersion.version}`;
  
  // 查找页脚元素并添加版本信息
  const footer = document.querySelector('.footer');
  if (footer) {
    footer.appendChild(versionElement);
  }
  
  // 在控制台输出详细版本信息
  console.log(
    '%c极速导航 ' + 
    '%cv' + currentVersion.version + 
    '%c构建于 ' + currentVersion.buildDate,
    'color:#1a73e8;font-weight:bold;', 
    'color:#4caf50;font-weight:bold;', 
    'color:#666;'
  );
}

// 比较版本号
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 < part2) return -1; // v1 < v2
    if (part1 > part2) return 1;  // v1 > v2
  }
  
  return 0; // v1 == v2
}

// 从download.php中获取最新版本号
function checkForUpdates() {
  // 创建一个隐藏的iframe来加载download.php
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = 'download.php';
  
  iframe.onload = function() {
    try {
      // 尝试从iframe中提取版本信息
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const versionElement = iframeDoc.querySelector('.app-version');
      
      if (versionElement) {
        // 提取版本号 (例如从 "版本: 0.0.2" 中提取 "0.0.2")
        const latestVersionText = versionElement.textContent;
        const latestVersion = latestVersionText.replace(/[^0-9.]/g, '');
        
        console.log('检测到最新版本:', latestVersion);
        console.log('当前版本:', currentVersion.version);
        
        // 如果有新版本可用
        if (compareVersions(currentVersion.version, latestVersion) < 0) {
          showUpdateNotification(latestVersion);
        }
      }
      
      // 移除iframe
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
      
    } catch (e) {
      console.error('获取版本信息失败:', e);
      // 移除iframe
      document.body.removeChild(iframe);
    }
  };
  
  // 添加iframe到body
  document.body.appendChild(iframe);
}

// 显示更新提示
function showUpdateNotification(newVersion) {
  // 创建更新提示元素
  const updateNotice = document.createElement('div');
  updateNotice.className = 'update-notification';
  updateNotice.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #1a73e8;
    color: white;
    padding: 10px 20px;
    border-radius: 50px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    font-size: 14px;
    display: flex;
    align-items: center;
    z-index: 1000;
    cursor: pointer;
  `;
  
  // 设置更新提示内容
  updateNotice.innerHTML = `
    <span style="margin-right:10px;">发现新版本 v${newVersion}</span>
    <button style="background:#fff;color:#1a73e8;border:none;border-radius:20px;padding:5px 15px;font-weight:bold;font-size:12px;">立即更新</button>
  `;
  
  // 添加点击事件，跳转到下载页
  updateNotice.addEventListener('click', function() {
    window.location.href = 'download.php';
  });
  
  // 添加到页面
  document.body.appendChild(updateNotice);
  
  // 更新版本显示元素
  const versionElement = document.getElementById('app-version-info');
  if (versionElement) {
    versionElement.textContent = `v${currentVersion.version} (有新版本)`;
    versionElement.style.color = '#ff6b00';
  }
}

// 隐藏APP下载相关元素函数
function hideAppDownloadElements() {
  // 首先尝试直接通过CSS隐藏元素
  const style = document.createElement('style');
  style.textContent = `
    .app-info, 
    p.app-intro, 
    .app-download-link, 
    button.nav-btn.app-download-btn, 
    form[action="download.php"] {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  
  // 然后通过JavaScript再次确认元素被隐藏
  setTimeout(() => {
    const selectors = [
      '.app-info', 
      'p.app-intro', 
      '.app-download-link', 
      'button.nav-btn.app-download-btn', 
      'form[action="download.php"]'
    ];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'none';
      });
    });
  }, 100);
}

// 在页面加载完成时执行自定义功能
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomFeatures);
} else {
  // 如果页面已经加载完成，直接执行
  initCustomFeatures();
}
// css filter
document.addEventListener('DOMContentLoaded', () => {
    const targetNode = document.body
    // 配置观察选项
    const config = {
        childList: true,
        subtree: true,
    }
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const element0 = document.querySelector('.app-info, div.app-info, p.app-intro, div.app-download-link, form[action="download.php"], button[type="submit"].nav-btn.app-download-btn');
                if (element0) {
                    element0.style.display = 'none';
                }
            }
        }
    })
    observer.observe(targetNode, config)
})
// end css filter
