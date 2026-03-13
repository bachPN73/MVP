@echo off
echo Starting build...
npm run build > build_log.txt 2>&1
echo Build finished with exit code %ERRORLEVEL%
