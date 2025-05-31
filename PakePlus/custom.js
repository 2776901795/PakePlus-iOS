// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
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
  
  // 4. 修改下载页面中的下载按钮行为
  modifyDownloadButtons();
  
  // 5. 处理安全区域（导航栏）问题
  handleSafeAreaInsets();
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
  // 使用fetch替代iframe，更可靠
  fetch('download.php')
    .then(response => response.text())
    .then(html => {
      // 创建一个临时的DOM元素来解析HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // 提取版本信息
      const versionElement = tempDiv.querySelector('.app-version');
      
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
    })
    .catch(error => {
      console.error('获取版本信息失败:', error);
    });
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

// 修改下载页面中的下载按钮行为
function modifyDownloadButtons() {
  // 检查是否在下载页面
  if (window.location.href.includes('download.php')) {
    // 使用MutationObserver监听DOM变化，确保动态加载的按钮也能被处理
    const observer = new MutationObserver(function(mutations) {
      handleDownloadButtons();
    });
    
    // 开始观察整个document变化
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    
    // 立即处理当前页面上的下载按钮
    setTimeout(handleDownloadButtons, 300);
  }
}

// 处理下载按钮
function handleDownloadButtons() {
  // 查找所有下载按钮
  const downloadForms = document.querySelectorAll('.download-form');
  
  downloadForms.forEach(form => {
    // 防止重复处理
    if (form.dataset.processed) return;
    form.dataset.processed = 'true';
    
    // 获取下载URL
    const formAction = form.getAttribute('action');
    if (!formAction) return;
    
    // 创建一个可见的链接替代表单
    const button = form.querySelector('button');
    if (!button) return;
    
    const linkText = button.textContent || '下载';
    const buttonClass = button.className;
    
    // 创建新的链接元素
    const newLink = document.createElement('a');
    newLink.href = formAction;
    newLink.className = buttonClass;
    newLink.innerHTML = button.innerHTML;
    newLink.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;text-decoration:none;';
    
    // 添加特殊属性以在PakePlus中触发系统浏览器
    newLink.setAttribute('target', '_system');
    newLink.setAttribute('rel', 'external');
    
    // 添加点击事件处理
    newLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 检查是否在PakePlus环境中
      const isPakePlus = /pakeplusclient/i.test(navigator.userAgent.toLowerCase());
      
      if (isPakePlus) {
        // 尝试使用window.open打开外部浏览器
        const opened = window.open(formAction, '_system');
        
        // 如果直接打开失败，显示提示
        if (!opened) {
          alert('请长按链接，选择在系统浏览器中打开，以完成下载');
          
          // 创建复制链接按钮
          const copyBtn = document.createElement('button');
          copyBtn.textContent = '复制下载链接';
          copyBtn.style.cssText = 'display:block;margin:10px auto;padding:8px 15px;background:#f5f5f5;border:none;border-radius:4px;';
          copyBtn.onclick = function() {
            navigator.clipboard.writeText(formAction).then(() => {
              alert('下载链接已复制，请在系统浏览器中粘贴访问');
              copyBtn.textContent = '已复制';
            });
          };
          
          form.parentNode.insertBefore(copyBtn, form.nextSibling);
        }
      } else {
        // 非PakePlus环境，直接跳转
        window.location.href = formAction;
      }
    });
    
    // 替换原表单
    form.parentNode.replaceChild(newLink, form);
    
    console.log('已修改下载按钮:', formAction);
  });
}

// 处理安全区域（导航栏）问题
function handleSafeAreaInsets() {
  // 添加用于检测是否为移动设备的函数
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  // 检测是否为Android设备
  function isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }
  
  // 检查是否在PakePlus环境中
  const isPakePlus = /pakeplusclient/i.test(navigator.userAgent.toLowerCase());
  
  // 如果是移动设备或PakePlus环境，应用安全区域padding
  if (isMobileDevice() || isPakePlus) {
    console.log('检测到移动设备，应用安全区域适配');
    
    // 创建样式元素
    const safeAreaStyle = document.createElement('style');
    
    // 基础padding值（基于设备类型调整）
    let bottomPadding = isAndroid() ? '50px' : '20px';
    
    // 使用CSS变量定义安全区域
    safeAreaStyle.textContent = `
      :root {
        --safe-area-inset-bottom: ${bottomPadding};
      }
      
      /* 应用到页面底部的元素 */
      .footer, 
      .page-footer,
      .bottom-nav,
      .fixed-bottom {
        padding-bottom: calc(10px + var(--safe-area-inset-bottom)) !important;
      }
      
      /* 固定在底部的浮动元素（如更新通知）需要添加margin */
      .update-notification {
        bottom: calc(20px + var(--safe-area-inset-bottom)) !important;
      }
      
      /* 为内容添加底部padding，防止被导航栏遮挡 */
      body {
        padding-bottom: var(--safe-area-inset-bottom);
      }
      
      /* 兼容iOS环境的安全区域 */
      @supports (padding-bottom: env(safe-area-inset-bottom)) {
        :root {
          --safe-area-inset-bottom: env(safe-area-inset-bottom);
        }
        
        body {
          padding-bottom: env(safe-area-inset-bottom);
        }
      }
    `;
    
    // 添加样式到页面头部
    document.head.appendChild(safeAreaStyle);
    
    // 检测屏幕尺寸变化（如旋转）并重新应用安全区域
    window.addEventListener('resize', function() {
      // 更新安全区域值（如果需要）
      console.log('屏幕尺寸变化，重新应用安全区域');
    });
    
    console.log('已应用安全区域适配');
  }
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
