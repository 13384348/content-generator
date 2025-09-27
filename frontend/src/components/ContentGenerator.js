import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContentGenerator.css';

const ContentGenerator = () => {
  const [contentTypes, setContentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [topic, setTopic] = useState('');
  const [hook, setHook] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContentTypes();
  }, []);

  const fetchContentTypes = async () => {
    try {
      const response = await axios.get('/api/contents');
      setContentTypes(response.data);
    } catch (error) {
      console.error('获取文案类型失败:', error);
      setError('加载文案类型失败');
    }
  };

  const handleGenerate = async () => {
    if (!selectedType || !topic.trim() || !hook.trim()) {
      setError('请填写所有必要信息');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedContent('');

    try {
      const response = await axios.post('/api/generate-content', {
        type: selectedType,
        topic: topic.trim(),
        hook: hook.trim()
      }, {
        timeout: 120000 // 设置120秒超时，文案生成需要更长时间
      });

      if (response.data.success) {
        setGeneratedContent(response.data.content);
      } else {
        setError(response.data.error || '生成文案失败');
      }
    } catch (error) {
      console.error('生成文案失败:', error);
      setError('生成文案失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('文案已复制到剪贴板');
  };

  const handleClear = () => {
    setTopic('');
    setHook('');
    setGeneratedContent('');
    setError('');
  };

  return (
    <div className="content-generator">
      <div className="header">
        <h2>选题+钩子自动写文案</h2>
        <p className="subtitle">根据您的选题和钩子，自动生成高质量文案</p>
      </div>

      <div className="content">
        <div className="input-section">
          <div className="input-group">
            <label htmlFor="contentType">选择文案类型</label>
            <select
              id="contentType"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select-input"
            >
              <option value="">请选择文案类型</option>
              {contentTypes.map(type => (
                <option key={type.type} value={type.type}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="topic">输入选题</label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="请输入您的选题内容..."
              className="textarea-input"
              rows="3"
            />
          </div>

          <div className="input-group">
            <label htmlFor="hook">输入钩子</label>
            <textarea
              id="hook"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="请输入钩子文案..."
              className="textarea-input"
              rows="3"
            />
          </div>

          <div className="button-group">
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedType || !topic.trim() || !hook.trim()}
              className="generate-button"
            >
              {loading ? '生成中...' : '生成文案'}
            </button>
            <button
              onClick={handleClear}
              className="clear-button"
            >
              清空内容
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {generatedContent && (
          <div className="result-section">
            <div className="result-header">
              <h3>生成的文案</h3>
              <button onClick={handleCopy} className="copy-button">
                复制文案
              </button>
            </div>
            <div className="result-content">
              <pre>{generatedContent}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;