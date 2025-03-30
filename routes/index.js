const express = require('express');
const router = express.Router();

// 基础路由
router.get('/status', (req, res) => {
  res.json({ status: '系统运行正常' });
});

module.exports = router;