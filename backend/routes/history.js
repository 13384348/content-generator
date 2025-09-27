const express = require('express');
const { auth, authenticateToken } = require('../middleware/auth');
const { getUserDatabase } = require('../database/user-db');
const router = express.Router();

// 保存使用记录
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { feature_type, content_type, input_data, output_data, usage_type = 'free' } = req.body;

    if (!feature_type || !output_data) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }

    const db = getUserDatabase();
    const userId = req.user?.id || null;
    const guestId = req.user?.guest_id || null;

    // 如果既没有用户ID也没有访客ID，则无法保存
    if (!userId && !guestId) {
      return res.status(401).json({
        success: false,
        error: '未授权用户'
      });
    }

    db.run(
      `INSERT INTO usage_records (user_id, guest_id, feature_type, content_type, input_data, output_data, usage_type, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        guestId,
        feature_type,
        content_type || null,
        JSON.stringify(input_data),
        JSON.stringify(output_data),
        usage_type,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      ],
      function(err) {
        if (err) {
          console.error('保存使用记录失败:', err);
          return res.status(500).json({
            success: false,
            error: '保存记录失败'
          });
        }

        res.json({
          success: true,
          data: {
            id: this.lastID,
            message: '记录保存成功'
          }
        });
      }
    );
  } catch (error) {
    console.error('保存使用记录错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 获取历史记录列表
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, feature_type } = req.query;
    const userId = req.user?.id || null;
    const guestId = req.user?.guest_id || null;

    if (!userId && !guestId) {
      return res.status(401).json({
        success: false,
        error: '未授权用户'
      });
    }

    const db = getUserDatabase();
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereClause = '';
    let params = [];

    if (userId) {
      whereClause = 'WHERE user_id = ?';
      params.push(userId);
    } else {
      whereClause = 'WHERE guest_id = ?';
      params.push(guestId);
    }

    if (feature_type) {
      whereClause += ` AND feature_type = ?`;
      params.push(feature_type);
    }

    // 获取总数
    db.get(
      `SELECT COUNT(*) as total FROM usage_records ${whereClause}`,
      params,
      function(err, countResult) {
        if (err) {
          console.error('查询历史记录总数失败:', err);
          return res.status(500).json({
            success: false,
            error: '查询失败'
          });
        }

        const total = countResult.total;

        // 获取列表数据
        const listParams = [...params, limit, offset];
        db.all(
          `SELECT id, feature_type, content_type, input_data, output_data, usage_type, created_at
           FROM usage_records ${whereClause}
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`,
          listParams,
          function(err, records) {
            if (err) {
              console.error('查询历史记录失败:', err);
              return res.status(500).json({
                success: false,
                error: '查询失败'
              });
            }

            // 解析JSON字段
            const processedRecords = records.map(record => {
              try {
                return {
                  ...record,
                  input_data: JSON.parse(record.input_data || '{}'),
                  output_data: JSON.parse(record.output_data || '{}')
                };
              } catch (parseErr) {
                console.error('解析JSON失败:', parseErr);
                return record;
              }
            });

            res.json({
              success: true,
              data: {
                records: processedRecords,
                total: total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('获取历史记录错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 获取单条历史记录详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;
    const guestId = req.user?.guest_id || null;

    if (!userId && !guestId) {
      return res.status(401).json({
        success: false,
        error: '未授权用户'
      });
    }

    const db = getUserDatabase();

    // 构建查询条件
    let whereClause = 'WHERE id = ?';
    let params = [id];

    if (userId) {
      whereClause += ' AND user_id = ?';
      params.push(userId);
    } else {
      whereClause += ' AND guest_id = ?';
      params.push(guestId);
    }

    db.get(
      `SELECT * FROM usage_records ${whereClause}`,
      params,
      function(err, record) {
        if (err) {
          console.error('查询历史记录详情失败:', err);
          return res.status(500).json({
            success: false,
            error: '查询失败'
          });
        }

        if (!record) {
          return res.status(404).json({
            success: false,
            error: '记录不存在'
          });
        }

        // 解析JSON字段
        try {
          record.input_data = JSON.parse(record.input_data || '{}');
          record.output_data = JSON.parse(record.output_data || '{}');
        } catch (parseErr) {
          console.error('解析JSON失败:', parseErr);
        }

        res.json({
          success: true,
          data: record
        });
      }
    );
  } catch (error) {
    console.error('获取历史记录详情错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 删除历史记录
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;
    const guestId = req.user?.guest_id || null;

    if (!userId && !guestId) {
      return res.status(401).json({
        success: false,
        error: '未授权用户'
      });
    }

    const db = getUserDatabase();

    // 构建查询条件
    let whereClause = 'WHERE id = ?';
    let params = [id];

    if (userId) {
      whereClause += ' AND user_id = ?';
      params.push(userId);
    } else {
      whereClause += ' AND guest_id = ?';
      params.push(guestId);
    }

    db.run(
      `DELETE FROM usage_records ${whereClause}`,
      params,
      function(err) {
        if (err) {
          console.error('删除历史记录失败:', err);
          return res.status(500).json({
            success: false,
            error: '删除失败'
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            error: '记录不存在或无权删除'
          });
        }

        res.json({
          success: true,
          message: '删除成功'
        });
      }
    );
  } catch (error) {
    console.error('删除历史记录错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 批量删除历史记录
router.delete('/batch/:ids', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.params;
    const userId = req.user?.id || null;
    const guestId = req.user?.guest_id || null;

    if (!userId && !guestId) {
      return res.status(401).json({
        success: false,
        error: '未授权用户'
      });
    }

    const idList = ids.split(',').filter(id => id && !isNaN(id));
    if (idList.length === 0) {
      return res.status(400).json({
        success: false,
        error: '无效的ID列表'
      });
    }

    const db = getUserDatabase();
    const placeholders = idList.map(() => '?').join(',');

    // 构建查询条件
    let whereClause = `WHERE id IN (${placeholders})`;
    let params = [...idList];

    if (userId) {
      whereClause += ' AND user_id = ?';
      params.push(userId);
    } else {
      whereClause += ' AND guest_id = ?';
      params.push(guestId);
    }

    db.run(
      `DELETE FROM usage_records ${whereClause}`,
      params,
      function(err) {
        if (err) {
          console.error('批量删除历史记录失败:', err);
          return res.status(500).json({
            success: false,
            error: '删除失败'
          });
        }

        res.json({
          success: true,
          message: `成功删除 ${this.changes} 条记录`
        });
      }
    );
  } catch (error) {
    console.error('批量删除历史记录错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

module.exports = router;