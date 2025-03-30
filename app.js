const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');

// 数据库配置
const config = {
  user: 'sa',
  password: '1',
  server: 'localhost',
  database: 'UserAuthDB',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));


// 数据库连接
sql.connect(config).then(pool => {
  console.log('数据库连接成功');
  
  // 初始化用户表
  pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
    CREATE TABLE users (
      id INT PRIMARY KEY IDENTITY(1,1),
      username NVARCHAR(255) NOT NULL UNIQUE,
      password NVARCHAR(255) NOT NULL,
      role NVARCHAR(50) NOT NULL,
      createdAt DATETIME DEFAULT GETDATE()
    )
  `);
}).catch(err => console.error('数据库连接失败:', err));

// 注册接口
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await sql.connect(config);
    
    // 检查用户是否存在
    const checkResult = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT username FROM users WHERE username = @username');

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 插入新用户
    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .input('role', sql.NVarChar, 'student')
      .query('INSERT INTO users (username, password, role) VALUES (@username, @password, @role)');

    res.status(201).json({ message: '学生注册成功' });
  } catch (err) {
    console.error('注册错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 登录接口
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const pool = await sql.connect(config);
    
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM users WHERE username = @username');

    const user = result.recordset[0];
    
    // 验证凭据
    if (!user || user.password !== password || user.role !== role) {
      return res.status(401).json({ message: '认证失败' });
    }

    res.json({ 
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 添加用户接口（管理员专用）
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const pool = await sql.connect(config);
    
    // 检查用户是否存在
    const checkResult = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT username FROM users WHERE username = @username');

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 插入新用户
    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .input('role', sql.NVarChar, role)
      .query('INSERT INTO users (username, password, role) VALUES (@username, @password, @role)');

    res.status(201).json({ message: '账号创建成功' });
  } catch (err) {
    console.error('创建用户错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});