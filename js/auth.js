// 通用请求处理函数
async function handleFormSubmit(endpoint, formData, successMessage) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${result.success ? 'success' : 'error'}`;
        alertDiv.textContent = result.message;

        document.querySelector('.container').prepend(alertDiv);
        
        if (result.success && result.redirect) {
            setTimeout(() => {
                window.location.href = result.redirect;
            }, 1500);
        }
    } catch (error) {
        console.error('请求错误:', error);
    }
}

// 注册页面逻辑
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            username: e.target.username.value,
            password: e.target.password.value
        };
        await handleFormSubmit('/api/register', formData, '注册成功');
    });
}

// 登录页面逻辑
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            username: e.target.username.value,
            password: e.target.password.value
        };
        await handleFormSubmit('/api/login', formData, '登录成功');
    });
}
// 使用HTML5 Geolocation API
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        map.setCenter([position.coords.longitude, position.coords.latitude]);
        new AMap.Marker({
            position: [position.coords.longitude, position.coords.latitude],
            title: '您的位置'
        }).setMap(map);
    });
}
// 在指定坐标添加标记
const marker = new AMap.Marker({
    position: [116.397428, 39.90923],
    title: '北京市中心'
});
map.add(marker);

// 点击标记显示信息窗口
const infoWindow = new AMap.InfoWindow({
    content: '<h3>天安门广场</h3><p>北京市东城区</p>'
});
marker.on('click', () => {
    infoWindow.open(map, marker.getPosition());
});
AMap.plugin('AMap.Driving', () => {
    const driving = new AMap.Driving({
        map: map,
        panel: 'panel' // 显示路线信息的div容器
    });
    
    // 设置起点和终点
    driving.search([
        { keyword: '北京市朝阳区望京SOHO', city: '北京' },
        { keyword: '北京首都国际机场', city: '北京' }
    ]);
});
function showLoading(show) {
    const btn = document.querySelector('#calculateBtn');
    if (!btn) {
        console.error('找不到按钮元素');
        return;
    }
    
    btn.disabled = show;
    btn.innerHTML = show ? '<div class="loader"></div> 规划中...' : '开始规划';
}
