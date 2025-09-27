@echo off
echo 🚀 正在部署到服务器...
echo.
echo ===== 部署日志 =====
echo 开始时间: %date% %time%
echo.

call deploy-simple.bat

echo.
echo ===== 部署完成 =====
echo 结束时间: %date% %time%
echo.
echo 按任意键关闭窗口...
pause >nul